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
            return jsonify({"error": "No properties or ownership data found"}), 404

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
        return jsonify({"error": "Failed to generate report"}), 500


def get_property_performance_report():
    try:
        realtor_email = session.get('user_email', '')
        if not realtor_email:
            return jsonify({"error": "User not logged in"}), 401

        properties_ref = db_ref.child('property')
        ownerships_ref = db_ref.child('Ownership')
        persons_ref = db_ref.child('Person')

        # Fetch data from Firebase
        properties = properties_ref.get()
        ownerships = ownerships_ref.get()
        persons = persons_ref.get()

        if not properties or not ownerships or not persons:
            return jsonify({"error": "No properties or ownership data found"}), 404

        report_data = []
        total_days_on_market = 0
        total_deal_time = 0
        deal_count = 0  # Number of properties with deal time (archived with reason "עסקה בוצעה")
        property_count = 0

        for prop_id, prop_data in properties.items():
            # Filter by realtor email
            if prop_data.get('realtor') != realtor_email:
                continue

            ownership = ownerships.get(prop_id)
            if not ownership:
                continue

            # Calculate days on market
            start_date_str = ownership.get('startDate')
            end_date_str = ownership.get('endDate', None)

            if start_date_str:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')

                # If end date exists, calculate days until end date; otherwise, calculate days until today
                if end_date_str:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                else:
                    end_date = datetime.now()

                days_on_market = (end_date - start_date).days
                total_days_on_market += days_on_market
                property_count += 1

                # Calculate deal time for properties with "עסקה בוצעה"
                if prop_data.get('archiveReason') == "עסקה בוצעה" and end_date_str:
                    deal_time = (end_date - start_date).days
                    total_deal_time += deal_time
                    deal_count += 1
            else:
                continue  # Skip this property if no start date

            # Get interested clients
            interested_clients = [person for person_id, person in persons.items()
                                  if prop_id in person.get('Type', {}).get('Client', {}).get('PropertiesList', [])]
            num_interested_clients = len(interested_clients)

            # Prepare the report data for each property
            report_data.append({
                'property_id': prop_id,
                'price': prop_data.get('Price', '') or '',
                'city': prop_data.get('city', '') or '',
                'roomsNum': prop_data.get('type', {}).get('apartment', {}).get('item:', {}).get('roomsNum', '') or '',
                'days_on_market': days_on_market,
                'num_interested_clients': num_interested_clients,
                'archiveReason': prop_data.get('archiveReason', '') or '',
                'endDate': end_date_str if end_date_str else '',
            })

        # Calculate average days on market
        average_days_on_market = total_days_on_market / property_count if property_count else 0

        # Calculate average deal time (only for properties archived with "עסקה בוצעה")
        average_deal_time = total_deal_time / deal_count if deal_count else 0

        return jsonify({
            'property_report': report_data,
            'average_days_on_market': average_days_on_market,
            'average_deal_time': average_deal_time
        }), 200

    except Exception as e:
        print(f"Error fetching performance report: {e}")
        return jsonify({"error": "Failed to generate report"}), 500

