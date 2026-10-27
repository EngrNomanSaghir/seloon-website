import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from database import get_db

def run_tests():
    # Clean up previous test entries if any
    conn = get_db()
    conn.execute("DELETE FROM bookings WHERE customer_email IN ('sophia@example.com', 'dup@example.com')")
    conn.commit()
    conn.close()

    app.config['TESTING'] = True
    client = app.test_client()
    routes = [
        '/',
        '/services',
        '/team',
        '/transformations',
        '/book',
        '/manage-booking',
        '/admin',
        '/api/available-slots?date=2026-10-25',
        '/download-ics/SLN-78210'
    ]

    print("--- Testing GET Routes ---")
    for r in routes:
        res = client.get(r)
        print(f"{r:40} -> Status {res.status_code}")
        assert res.status_code == 200, f"Route failed: {r}"

    print("\n--- Testing Booking POST API ---")
    post_res = client.post('/api/book', json={
        'service_id': 1,
        'stylist_id': 1,
        'date': '2026-10-28',
        'time': '03:15 PM',
        'name': 'Sophia Loren',
        'email': 'sophia@example.com',
        'phone': '+1 (555) 999-8888',
        'notes': 'Test booking verification'
    })
    data = post_res.get_json()
    print("Booking response:", data)
    assert post_res.status_code == 200
    assert data['success'] is True
    booking_code = data['booking_code']

    print(f"\n--- Testing Confirmation Page for {booking_code} ---")
    conf_res = client.get(f'/confirmation/{booking_code}')
    print(f"Confirmation status: {conf_res.status_code}")
    assert conf_res.status_code == 200

    print("\n--- Testing Slot Availability Collision Check ---")
    # Trying to book the exact same stylist, date, and time should be rejected (409 Conflict)
    collision_res = client.post('/api/book', json={
        'service_id': 1,
        'stylist_id': 1,
        'date': '2026-10-28',
        'time': '03:15 PM',
        'name': 'Duplicate Person',
        'email': 'dup@example.com',
        'phone': '+1 (555) 000-0000'
    })
    print("Collision test status:", collision_res.status_code, collision_res.get_json())
    assert collision_res.status_code == 409

    print("\n--- Testing Admin Status Update ---")
    admin_res = client.post('/api/admin/update-status', json={
        'booking_id': 1,
        'status': 'completed'
    })
    assert admin_res.status_code == 200
    print("Admin update response:", admin_res.get_json())

    print("\n--- Testing Specialist Live Availability API ---")
    avail_res = client.get('/api/specialist-availability?stylist_id=1&date=2026-10-28')
    assert avail_res.status_code == 200
    avail_data = avail_res.get_json()
    print("Specialist availability response keys:", list(avail_data.keys()))
    assert 'slots' in avail_data
    assert 'shift_summary' in avail_data
    assert avail_data['stylist']['name'] == 'Elena Rostova'

    print("\n--- Testing Worker Add & Shift Configuration API ---")
    add_worker_res = client.post('/api/admin/workers/add', json={
        'name': 'Isabella Martinez',
        'title': 'Master Color & Extension Specialist',
        'experience_years': 6,
        'rating': 4.97,
        'reviews_count': 45,
        'specialties': 'Hand-Tied Extensions, Platinum Blonding',
        'available_days': 'Mon,Wed,Thu,Fri,Sat',
        'shift_start': '10:00 AM',
        'shift_end': '06:00 PM',
        'shift_type': 'Day Shift (10 AM - 6 PM)',
        'bio': 'Internationally certified extension artist.',
        'is_active': 1
    })
    assert add_worker_res.status_code == 200
    add_worker_data = add_worker_res.get_json()
    print("Add worker response:", add_worker_data)
    assert add_worker_data['success'] is True
    test_worker_id = add_worker_data['worker_id']

    print("\n--- Testing Worker Update Shift API ---")
    update_res = client.post('/api/admin/workers/update', json={
        'id': test_worker_id,
        'name': 'Isabella Martinez',
        'title': 'Lead Color Director',
        'experience_years': 7,
        'rating': 4.99,
        'specialties': 'Hand-Tied Extensions, Balayage',
        'available_days': 'Tue,Wed,Thu,Fri,Sat',
        'shift_start': '09:00 AM',
        'shift_end': '05:00 PM',
        'shift_type': 'Morning & Midday (9 AM - 5 PM)',
        'is_active': 1
    })
    assert update_res.status_code == 200
    print("Update worker response:", update_res.get_json())

    print("\n--- Testing Worker Toggle Status API ---")
    toggle_res = client.post('/api/admin/workers/toggle-status', json={'id': test_worker_id})
    assert toggle_res.status_code == 200
    print("Toggle response:", toggle_res.get_json())

    print("\n--- Testing Worker Delete API ---")
    del_res = client.post('/api/admin/workers/delete', json={'id': test_worker_id})
    assert del_res.status_code == 200
    print("Delete worker response:", del_res.get_json())

    print("\n--- Testing Manager Password Verification API ---")
    bad_pass_res = client.post('/api/manager/verify-password', json={'password': 'wrongpassword'})
    assert bad_pass_res.status_code == 401
    assert bad_pass_res.get_json()['success'] is False

    good_pass_res = client.post('/api/manager/verify-password', json={'password': 'ceo2026'})
    assert good_pass_res.status_code == 200
    assert good_pass_res.get_json()['success'] is True
    print("Manager authentication verified successfully!")

    print("\n--- Testing Manager Service Add API ---")
    add_svc_res = client.post('/api/manager/services/add', json={
        'name': 'Test Diamond Silk Infusion',
        'category': 'Hair Styling & Cuts',
        'price': 175.00,
        'duration_min': 90,
        'badge': 'VIP Treatment',
        'image_url': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
        'description': 'Ultrasonic deep conditioning for extreme brilliance.',
        'is_popular': 1
    })
    assert add_svc_res.status_code == 200
    add_svc_data = add_svc_res.get_json()
    print("Add service response:", add_svc_data)
    assert add_svc_data['success'] is True
    test_svc_id = add_svc_data['service_id']

    print("\n--- Testing Manager Service Update API ---")
    update_svc_res = client.post('/api/manager/services/update', json={
        'id': test_svc_id,
        'name': 'Test Diamond Silk Infusion Deluxe',
        'category': 'Hair Styling & Cuts',
        'price': 195.00,
        'duration_min': 105,
        'badge': 'Client Favorite',
        'image_url': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
        'description': 'Updated deluxe description with caviar extract.',
        'is_popular': 0
    })
    assert update_svc_res.status_code == 200
    print("Update service response:", update_svc_res.get_json())
    assert update_svc_res.get_json()['success'] is True

    print("\n--- Testing Manager Service Delete API ---")
    del_svc_res = client.post('/api/manager/services/delete', json={'id': test_svc_id})
    assert del_svc_res.status_code == 200
    print("Delete service response:", del_svc_res.get_json())
    assert del_svc_res.get_json()['success'] is True

    print("\n==========================================")
    print("  ALL TESTS PASSED SUCCESSFULLY (100%)!   ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
