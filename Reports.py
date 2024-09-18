from flask import jsonify, request, session
from firebase_config import initialize_firebase
import datetime
from datetime import datetime, timedelta

db_ref = initialize_firebase()

def generate_report(realtor_email='', report_type='property'):
    try:
        properties_ref = db_ref.child('property')
        ownerships_ref = db_ref.child('Ownership')
        users_ref = db_ref.child("Person")

        # Fetch data from Firebase
        properties = properties_ref.get()
        ownerships = ownerships_ref.get()
        all_users = users_ref.get()

        if not properties or not ownerships or not all_users:
            return []

        report_data = []

        for prop_id, prop_data in properties.items():
            if not prop_data:
                continue

            # Example: Filter by realtor's email and property status for the report
            if realtor_email and prop_data.get('realtor') != realtor_email:
                continue

            owner_name = ''
            for ownership_id, ownership in ownerships.items():
                if ownership.get('propertyID') == prop_id:
                    owner_id = ownership.get('PersonID')
                    owner_name = f"{all_users.get(str(owner_id), {}).get('FirstName', '')} {all_users.get(str(owner_id), {}).get('LastName', '')}".strip()
                    break

            # Prepare report entry (adjust fields as necessary)
            report_entry = {
                'property_id': prop_id,
                'owner': owner_name,
                'price': prop_data.get('Price', 'N/A'),
                'city': prop_data.get('city', 'N/A'),
                'street': prop_data.get('street', 'N/A'),
                'rooms': prop_data.get('type', {}).get('apartment', {}).get('item:', {}).get('roomsNum', 'N/A'),
                'status': prop_data.get('status', 'N/A'),
                'transactionType': ownership.get('rentORsell', ''),
                'archiveReason': prop_data.get('archiveReason', ''),
                'endDate': ownership.get('endDate', '')
            }

            report_data.append(report_entry)

        return report_data

    except Exception as e:
        print(f"Error generating report: {e}")
        return []

def get_date_filter_ranges():
    today = datetime.now()
    one_month_ago = today - timedelta(days=30)
    six_months_ago = today - timedelta(days=6 * 30)
    one_year_ago = today - timedelta(days=365)
    return one_month_ago, six_months_ago, one_year_ago

def generate_active_vs_archived_report(realtor_email):
    try:
        properties_ref = db_ref.child('property')
        ownerships_ref = db_ref.child('Ownership')

        # Retrieve data from Firebase
        properties = properties_ref.get()
        ownerships = ownerships_ref.get()

        if not properties or not ownerships:
            return []

        # Date filters
        one_month_ago, six_months_ago, one_year_ago = get_date_filter_ranges()

        active_properties = 0
        archived_properties = 0
        archived_with_deal_completed = {'month': 0, 'half_year': 0, 'year': 0}
        archived_with_other_reason = {'month': 0, 'half_year': 0, 'year': 0}

        for prop_id, prop_data in properties.items():
            if not prop_data or prop_data.get('realtor') != realtor_email:
                continue

            prop_status = prop_data.get('status', 'N/A')
            archive_reason = prop_data.get('archiveReason', 'N/A')
            end_date_str = ownerships.get(prop_id, {}).get('endDate', '')

            if prop_status == 'active':
                active_properties += 1
            elif prop_status == 'archived':
                archived_properties += 1

                # Parse the end date
                try:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                except (ValueError, TypeError):
                    end_date = None

                if end_date:
                    if archive_reason == 'עסקה בוצעה':
                        if end_date >= one_month_ago:
                            archived_with_deal_completed['month'] += 1
                        if end_date >= six_months_ago:
                            archived_with_deal_completed['half_year'] += 1
                        if end_date >= one_year_ago:
                            archived_with_deal_completed['year'] += 1
                    else:
                        if end_date >= one_month_ago:
                            archived_with_other_reason['month'] += 1
                        if end_date >= six_months_ago:
                            archived_with_other_reason['half_year'] += 1
                        if end_date >= one_year_ago:
                            archived_with_other_reason['year'] += 1

        return {
            'active_properties': active_properties,
            'archived_properties': archived_properties,
            'archived_with_deal_completed': archived_with_deal_completed,
            'archived_with_other_reason': archived_with_other_reason,
        }

    except Exception as e:
        print(f"Error generating report: {e}")
        return {}

