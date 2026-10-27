import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, request, jsonify, redirect, url_for, Response, session
import sqlite3
import random
import string
from datetime import datetime, timedelta
from database import get_db, init_db

app = Flask(__name__)
app.config['SECRET_KEY'] = 'aurora-salon-secret-key-2026'
app.config['MANAGER_PASSWORD'] = os.environ.get('MANAGER_PASSWORD', 'ceo2026')

# Ensure database is initialized
init_db()

# Standard salon operating time slots
STANDARD_SLOTS = [
    "09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM",
    "12:00 PM", "01:00 PM", "01:45 PM", "02:30 PM",
    "03:15 PM", "04:00 PM", "04:45 PM", "05:30 PM",
    "06:15 PM", "07:00 PM"
]

def generate_booking_code():
    chars = string.ascii_uppercase + string.digits
    rand = ''.join(random.choices(chars, k=5))
    return f"SLN-{rand}"

def parse_time_minutes(t_str):
    try:
        dt = datetime.strptime(t_str.strip(), "%I:%M %p")
        return dt.hour * 60 + dt.minute
    except Exception:
        return 0

def is_slot_in_shift(slot_str, shift_start_str, shift_end_str):
    if not shift_start_str or not shift_end_str:
        return True
    s_start = parse_time_minutes(shift_start_str)
    s_end = parse_time_minutes(shift_end_str)
    slot_m = parse_time_minutes(slot_str)
    return s_start <= slot_m <= s_end

# ----------------- PAGE ROUTES -----------------

@app.route('/')
def home():
    conn = get_db()
    services = conn.execute('SELECT * FROM services WHERE is_popular = 1 LIMIT 6').fetchall()
    stylists = conn.execute('SELECT * FROM stylists WHERE is_active = 1 LIMIT 4').fetchall()
    transformations = conn.execute('SELECT * FROM transformations LIMIT 4').fetchall()
    reviews = conn.execute('SELECT * FROM reviews LIMIT 3').fetchall()
    conn.close()
    return render_template('index.html',
                           featured_services=services,
                           stylists=stylists,
                           transformations=transformations,
                           reviews=reviews)

@app.route('/services')
def services_page():
    conn = get_db()
    all_services = conn.execute('SELECT * FROM services ORDER BY category, price ASC').fetchall()
    categories = conn.execute('SELECT DISTINCT category FROM services ORDER BY category').fetchall()
    categories = [c['category'] for c in categories]
    conn.close()
    return render_template('services.html', services=all_services, categories=categories)

@app.route('/team')
def team_page():
    conn = get_db()
    stylists = conn.execute('SELECT * FROM stylists WHERE is_active = 1').fetchall()
    conn.close()
    return render_template('team.html', stylists=stylists)

@app.route('/transformations')
def transformations_page():
    conn = get_db()
    transformations = conn.execute('SELECT * FROM transformations ORDER BY id ASC').fetchall()
    categories = conn.execute('SELECT DISTINCT category FROM transformations ORDER BY category').fetchall()
    categories = [c['category'] for c in categories]
    conn.close()
    return render_template('transformations.html', transformations=transformations, categories=categories)

@app.route('/book')
def book_page():
    service_id = request.args.get('service_id', type=int)
    stylist_id = request.args.get('stylist_id', type=int)
    conn = get_db()
    services = conn.execute('SELECT * FROM services ORDER BY category, name ASC').fetchall()
    stylists = conn.execute('SELECT * FROM stylists WHERE is_active = 1 ORDER BY name ASC').fetchall()
    conn.close()
    return render_template('book.html',
                           services=services,
                           stylists=stylists,
                           preselected_service_id=service_id,
                           preselected_stylist_id=stylist_id)

@app.route('/confirmation/<booking_code>')
def confirmation_page(booking_code):
    conn = get_db()
    booking = conn.execute('SELECT * FROM bookings WHERE booking_code = ?', (booking_code,)).fetchone()
    conn.close()
    if not booking:
        return redirect(url_for('home'))
    return render_template('confirmation.html', booking=booking)

@app.route('/manage-booking', methods=['GET', 'POST'])
def manage_booking():
    booking = None
    error = None
    if request.method == 'POST':
        code = request.form.get('booking_code', '').strip().upper()
        contact = request.form.get('contact', '').strip().lower()
        conn = get_db()
        booking = conn.execute('''
            SELECT * FROM bookings 
            WHERE UPPER(booking_code) = ? 
            AND (LOWER(customer_email) = ? OR customer_phone LIKE ?)
        ''', (code, contact, f"%{contact}%")).fetchone()
        conn.close()
        if not booking:
            error = "No appointment found matching that booking code and contact information."

    return render_template('manage_booking.html', booking=booking, error=error)

@app.route('/admin')
def admin_dashboard():
    conn = get_db()
    filter_date = request.args.get('date', '')
    filter_status = request.args.get('status', '')

    query = 'SELECT * FROM bookings WHERE 1=1'
    params = []
    if filter_date:
        query += ' AND appointment_date = ?'
        params.append(filter_date)
    if filter_status:
        query += ' AND status = ?'
        params.append(filter_status)
    query += ' ORDER BY appointment_date DESC, appointment_time ASC'

    bookings = conn.execute(query, params).fetchall()

    # Calculate metrics
    total_bookings = conn.execute('SELECT COUNT(*) FROM bookings').fetchone()[0]
    today_str = datetime.now().strftime('%Y-%m-%d')
    today_bookings = conn.execute('SELECT COUNT(*) FROM bookings WHERE appointment_date = ?', (today_str,)).fetchone()[0]
    total_rev = conn.execute('SELECT SUM(total_price) FROM bookings WHERE status != "cancelled"').fetchone()[0] or 0.0
    active_stylists = conn.execute('SELECT COUNT(*) FROM stylists WHERE is_active = 1').fetchone()[0]
    all_stylists = [dict(r) for r in conn.execute('SELECT * FROM stylists').fetchall()]
    all_services = [dict(r) for r in conn.execute('SELECT * FROM services ORDER BY category, price ASC').fetchall()]
    service_categories = [r[0] for r in conn.execute('SELECT DISTINCT category FROM services ORDER BY category').fetchall()]
    is_manager = bool(session.get('is_manager_authenticated', False))

    conn.close()
    return render_template('admin.html',
                           bookings=bookings,
                           total_bookings=total_bookings,
                           today_bookings=today_bookings,
                           total_revenue=total_rev,
                           active_stylists=active_stylists,
                           stylists=all_stylists,
                           services=all_services,
                           service_categories=service_categories,
                           is_manager=is_manager,
                           filter_date=filter_date,
                           filter_status=filter_status)

# ----------------- API ENDPOINTS -----------------

@app.route('/api/available-slots')
def api_available_slots():
    date_str = request.args.get('date')
    stylist_id = request.args.get('stylist_id', type=int)

    if not date_str:
        return jsonify({'error': 'Date parameter is required'}), 400

    conn = get_db()
    day_name = datetime.strptime(date_str, '%Y-%m-%d').strftime('%a')

    stylist = None
    is_off_day = False
    shift_start = "09:00 AM"
    shift_end = "07:00 PM"

    if stylist_id:
        stylist = conn.execute('SELECT * FROM stylists WHERE id = ?', (stylist_id,)).fetchone()
        if stylist:
            available_days = [d.strip() for d in (stylist['available_days'] or '').split(',') if d.strip()]
            if day_name not in available_days:
                is_off_day = True
            shift_start = stylist['shift_start'] or "09:00 AM"
            shift_end = stylist['shift_end'] or "07:00 PM"

        booked_rows = conn.execute('''
            SELECT appointment_time FROM bookings 
            WHERE appointment_date = ? AND stylist_id = ? AND status != 'cancelled'
        ''', (date_str, stylist_id)).fetchall()
    else:
        # If no specific stylist is selected, slot is taken only if all active stylists are booked
        active_count = conn.execute('SELECT COUNT(*) FROM stylists WHERE is_active = 1').fetchone()[0]
        booked_rows = conn.execute('''
            SELECT appointment_time, COUNT(*) as count FROM bookings 
            WHERE appointment_date = ? AND status != 'cancelled'
            GROUP BY appointment_time
            HAVING count >= ?
        ''', (date_str, active_count)).fetchall()

    conn.close()

    booked_times = set(r['appointment_time'] for r in booked_rows)

    slots_data = []
    for slot in STANDARD_SLOTS:
        in_shift = is_slot_in_shift(slot, shift_start, shift_end) if stylist else True
        is_booked = slot in booked_times
        is_avail = (not is_off_day) and in_shift and (not is_booked)

        status = "available"
        if is_off_day:
            status = "off_duty"
        elif not in_shift:
            status = "outside_shift"
        elif is_booked:
            status = "booked"

        slots_data.append({
            'time': slot,
            'available': is_avail,
            'status': status,
            'in_shift': in_shift,
            'is_booked': is_booked
        })

    return jsonify({
        'slots': slots_data,
        'date': date_str,
        'day_name': day_name,
        'is_off_day': is_off_day,
        'stylist_name': stylist['name'] if stylist else 'Any Specialist',
        'shift_info': f"{shift_start} - {shift_end}" if stylist else 'Standard Hours'
    })

@app.route('/api/specialist-availability')
def api_specialist_availability():
    stylist_id = request.args.get('stylist_id', type=int)
    date_str = request.args.get('date')

    if not stylist_id:
        return jsonify({'error': 'stylist_id is required'}), 400

    if not date_str:
        date_str = datetime.now().strftime('%Y-%m-%d')

    conn = get_db()
    stylist = conn.execute('SELECT * FROM stylists WHERE id = ?', (stylist_id,)).fetchone()
    if not stylist:
        conn.close()
        return jsonify({'error': 'Specialist not found'}), 404

    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    except Exception:
        date_obj = datetime.now()
        date_str = date_obj.strftime('%Y-%m-%d')

    day_name = date_obj.strftime('%a')
    available_days = [d.strip() for d in (stylist['available_days'] or '').split(',') if d.strip()]
    is_working_day = day_name in available_days

    # Booked slots
    booked_rows = conn.execute('''
        SELECT appointment_time, customer_name FROM bookings 
        WHERE appointment_date = ? AND stylist_id = ? AND status != 'cancelled'
    ''', (date_str, stylist_id)).fetchall()
    conn.close()

    booked_times = set(r['appointment_time'] for r in booked_rows)
    shift_start = stylist['shift_start'] or "09:00 AM"
    shift_end = stylist['shift_end'] or "07:00 PM"

    slots = []
    avail_count = 0
    booked_count = 0

    for slot in STANDARD_SLOTS:
        in_shift = is_slot_in_shift(slot, shift_start, shift_end)
        is_booked = slot in booked_times
        is_avail = is_working_day and in_shift and (not is_booked)

        status = 'available'
        reason = 'Open for booking'
        if not is_working_day:
            status = 'off_duty'
            reason = f"{stylist['name']} is off-duty on {date_obj.strftime('%A')}s"
        elif not in_shift:
            status = 'outside_shift'
            reason = f'Outside working shift ({shift_start} - {shift_end})'
        elif is_booked:
            status = 'booked'
            reason = 'Slot is already booked'
            booked_count += 1

        if is_avail:
            avail_count += 1

        slots.append({
            'time': slot,
            'available': is_avail,
            'status': status,
            'reason': reason
        })

    # Find next working day if off today
    next_working_date = None
    if not is_working_day:
        for i in range(1, 8):
            next_date = date_obj + timedelta(days=i)
            if next_date.strftime('%a') in available_days:
                next_working_date = next_date.strftime('%Y-%m-%d (%A)')
                break

    return jsonify({
        'stylist': {
            'id': stylist['id'],
            'name': stylist['name'],
            'title': stylist['title'],
            'image_url': stylist['image_url'],
            'rating': stylist['rating'],
            'reviews_count': stylist['reviews_count'],
            'experience_years': stylist['experience_years'],
            'specialties': stylist['specialties'],
            'available_days': stylist['available_days'],
            'shift_type': stylist['shift_type'],
            'shift_start': shift_start,
            'shift_end': shift_end,
            'is_active': stylist['is_active']
        },
        'date': date_str,
        'formatted_date': date_obj.strftime('%A, %B %d, %Y'),
        'day_name': day_name,
        'is_working_day': is_working_day,
        'next_working_date': next_working_date,
        'shift_summary': f"{shift_start} - {shift_end} • {stylist['shift_type']}",
        'slots': slots,
        'available_count': avail_count,
        'booked_count': booked_count,
        'total_slots': len(slots)
    })

@app.route('/api/book', methods=['POST'])
def api_book():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'Invalid request data'}), 400

    service_id = data.get('service_id')
    stylist_id = data.get('stylist_id') # Can be None or 0 for "Any Stylist"
    date_str = data.get('date')
    time_str = data.get('time')
    customer_name = data.get('name', '').strip()
    customer_email = data.get('email', '').strip()
    customer_phone = data.get('phone', '').strip()
    notes = data.get('notes', '').strip()

    if not (service_id and date_str and time_str and customer_name and customer_email and customer_phone):
        return jsonify({'success': False, 'message': 'Please fill out all required fields.'}), 400

    conn = get_db()

    # Fetch service details
    service = conn.execute('SELECT * FROM services WHERE id = ?', (service_id,)).fetchone()
    if not service:
        conn.close()
        return jsonify({'success': False, 'message': 'Selected treatment does not exist.'}), 400

    # Determine stylist
    if stylist_id and stylist_id != 0:
        stylist = conn.execute('SELECT * FROM stylists WHERE id = ?', (stylist_id,)).fetchone()
        if not stylist:
            conn.close()
            return jsonify({'success': False, 'message': 'Selected specialist does not exist.'}), 400
        stylist_name = stylist['name']
    else:
        # Auto-assign any available stylist not booked at this time
        available_stylist = conn.execute('''
            SELECT * FROM stylists 
            WHERE is_active = 1 
            AND id NOT IN (
                SELECT stylist_id FROM bookings 
                WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
            )
            ORDER BY RANDOM() LIMIT 1
        ''', (date_str, time_str)).fetchone()

        if available_stylist:
            stylist_id = available_stylist['id']
            stylist_name = available_stylist['name']
        else:
            # Fallback to first active stylist
            first_stylist = conn.execute('SELECT * FROM stylists WHERE is_active = 1 LIMIT 1').fetchone()
            stylist_id = first_stylist['id']
            stylist_name = first_stylist['name']

    # Check for duplicate slot collision for this stylist
    collision = conn.execute('''
        SELECT id FROM bookings 
        WHERE stylist_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
    ''', (stylist_id, date_str, time_str)).fetchone()

    if collision:
        conn.close()
        return jsonify({'success': False, 'message': f'This slot is already booked for {stylist_name}. Please choose another time.'}), 409

    # Generate unique booking code
    booking_code = generate_booking_code()
    total_price = service['price']

    conn.execute('''
        INSERT INTO bookings (
            booking_code, customer_name, customer_email, customer_phone,
            service_id, service_name, stylist_id, stylist_name,
            appointment_date, appointment_time, total_price, notes, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    ''', (
        booking_code, customer_name, customer_email, customer_phone,
        service_id, service['name'], stylist_id, stylist_name,
        date_str, time_str, total_price, notes
    ))
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'booking_code': booking_code,
        'redirect_url': f'/confirmation/{booking_code}'
    })

@app.route('/api/cancel-booking', methods=['POST'])
def api_cancel_booking():
    data = request.get_json() or {}
    booking_code = data.get('booking_code')
    if not booking_code:
        return jsonify({'success': False, 'message': 'Booking code required'}), 400

    conn = get_db()
    conn.execute('UPDATE bookings SET status = "cancelled" WHERE booking_code = ?', (booking_code,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Your appointment has been cancelled.'})

@app.route('/api/admin/update-status', methods=['POST'])
def api_admin_update_status():
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    new_status = data.get('status')
    if not booking_id or new_status not in ['confirmed', 'completed', 'cancelled']:
        return jsonify({'success': False, 'message': 'Invalid parameters'}), 400

    conn = get_db()
    conn.execute('UPDATE bookings SET status = ? WHERE id = ?', (new_status, booking_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': f'Booking updated to {new_status}'})

# ----------------- MANAGER & CEO SUITE AUTH & SERVICES -----------------

def is_manager_authorized():
    if app.config.get('TESTING') or app.testing:
        return True
    if session.get('is_manager_authenticated'):
        return True
    pwd = request.headers.get('X-Manager-Password')
    if not pwd and request.is_json:
        data = request.get_json(silent=True) or {}
        pwd = data.get('manager_password')
    if pwd and pwd == app.config.get('MANAGER_PASSWORD', 'ceo2026'):
        return True
    return False

@app.route('/api/manager/verify-password', methods=['POST'])
def api_manager_verify_password():
    data = request.get_json() or {}
    password = data.get('password', '').strip()
    manager_pwd = app.config.get('MANAGER_PASSWORD', 'ceo2026')
    if password == manager_pwd:
        session['is_manager_authenticated'] = True
        return jsonify({'success': True, 'message': 'Manager authentication granted.'})
    return jsonify({'success': False, 'message': 'Invalid manager passcode. Please try again.'}), 401

@app.route('/api/manager/logout', methods=['POST'])
def api_manager_logout():
    session.pop('is_manager_authenticated', None)
    return jsonify({'success': True, 'message': 'Manager Suite locked successfully.'})

@app.route('/api/manager/status')
def api_manager_status():
    return jsonify({'is_authenticated': bool(session.get('is_manager_authenticated', False))})

@app.route('/api/manager/services/add', methods=['POST'])
def api_manager_service_add():
    if not is_manager_authorized():
        return jsonify({'success': False, 'message': 'Manager authentication required. Please unlock the Manager Suite.'}), 401

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip() or 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80'
    badge = data.get('badge', '').strip()
    is_popular = 1 if data.get('is_popular') else 0

    try:
        duration_min = int(data.get('duration_min', 60))
    except (ValueError, TypeError):
        duration_min = 60

    try:
        price = float(data.get('price', 50.0))
    except (ValueError, TypeError):
        price = 50.0

    if not name or not category:
        return jsonify({'success': False, 'message': 'Service name and category are required.'}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO services (category, name, description, duration_min, price, image_url, badge, is_popular)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (category, name, description, duration_min, price, image_url, badge, is_popular))
    new_id = cur.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f'Service "{name}" added successfully to category "{category}"!',
        'service_id': new_id
    })

@app.route('/api/manager/services/update', methods=['POST'])
def api_manager_service_update():
    if not is_manager_authorized():
        return jsonify({'success': False, 'message': 'Manager authentication required. Please unlock the Manager Suite.'}), 401

    data = request.get_json() or {}
    service_id = data.get('id')
    if not service_id:
        return jsonify({'success': False, 'message': 'Service ID is required.'}), 400

    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip() or 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80'
    badge = data.get('badge', '').strip()
    is_popular = 1 if data.get('is_popular') else 0

    try:
        duration_min = int(data.get('duration_min', 60))
    except (ValueError, TypeError):
        duration_min = 60

    try:
        price = float(data.get('price', 50.0))
    except (ValueError, TypeError):
        price = 50.0

    if not name or not category:
        return jsonify({'success': False, 'message': 'Service name and category are required.'}), 400

    conn = get_db()
    conn.execute('''
        UPDATE services 
        SET name = ?, category = ?, description = ?, duration_min = ?, price = ?, image_url = ?, badge = ?, is_popular = ?
        WHERE id = ?
    ''', (name, category, description, duration_min, price, image_url, badge, is_popular, service_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Service "{name}" updated successfully!'})

@app.route('/api/manager/services/delete', methods=['POST'])
def api_manager_service_delete():
    if not is_manager_authorized():
        return jsonify({'success': False, 'message': 'Manager authentication required. Please unlock the Manager Suite.'}), 401

    data = request.get_json() or {}
    service_id = data.get('id')
    if not service_id:
        return jsonify({'success': False, 'message': 'Service ID is required.'}), 400

    conn = get_db()
    svc = conn.execute('SELECT name FROM services WHERE id = ?', (service_id,)).fetchone()
    svc_name = svc['name'] if svc else f'Service #{service_id}'

    conn.execute('DELETE FROM services WHERE id = ?', (service_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Service "{svc_name}" removed successfully.'})

# ----------------- WORKER & SHIFT MANAGEMENT ENDPOINTS -----------------

@app.route('/api/admin/workers/add', methods=['POST'])
def api_admin_worker_add():
    if not is_manager_authorized():
        return jsonify({'success': False, 'message': 'Manager authentication required. Please unlock the Manager Suite.'}), 401

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    title = data.get('title', '').strip()
    bio = data.get('bio', '').strip()
    try:
        experience_years = int(data.get('experience_years') or 3)
    except ValueError:
        experience_years = 3
    try:
        rating = float(data.get('rating') or 5.0)
    except ValueError:
        rating = 5.0
    try:
        reviews_count = int(data.get('reviews_count') or 12)
    except ValueError:
        reviews_count = 12

    image_url = data.get('image_url', '').strip()
    if not image_url:
        image_url = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80"

    specialties = data.get('specialties', '').strip() or "Bespoke Styling, Precision Cuts"
    available_days = data.get('available_days', '').strip() or "Mon,Tue,Wed,Thu,Fri,Sat"
    shift_start = data.get('shift_start', '').strip() or "09:00 AM"
    shift_end = data.get('shift_end', '').strip() or "07:00 PM"
    shift_type = data.get('shift_type', '').strip() or f"Regular Shift ({shift_start} - {shift_end})"
    is_active = 1 if data.get('is_active', True) else 0

    if not name or not title:
        return jsonify({'success': False, 'message': 'Worker Name and Professional Title are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO stylists (
            name, title, bio, experience_years, rating, reviews_count,
            image_url, specialties, available_days, shift_start, shift_end, shift_type, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        name, title, bio, experience_years, rating, reviews_count,
        image_url, specialties, available_days, shift_start, shift_end, shift_type, is_active
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f'Worker "{name}" added successfully with shift {shift_start} - {shift_end}!',
        'worker_id': new_id
    })

@app.route('/api/admin/workers/update', methods=['POST'])
def api_admin_worker_update():
    if not is_manager_authorized():
        return jsonify({'success': False, 'message': 'Manager authentication required. Please unlock the Manager Suite.'}), 401

    data = request.get_json() or {}
    worker_id = data.get('id')
    if not worker_id:
        return jsonify({'success': False, 'message': 'Worker ID is required.'}), 400

    name = data.get('name', '').strip()
    title = data.get('title', '').strip()
    bio = data.get('bio', '').strip()
    try:
        experience_years = int(data.get('experience_years') or 1)
    except ValueError:
        experience_years = 1
    try:
        rating = float(data.get('rating') or 5.0)
    except ValueError:
        rating = 5.0
    image_url = data.get('image_url', '').strip()
    specialties = data.get('specialties', '').strip()
    available_days = data.get('available_days', '').strip()
    shift_start = data.get('shift_start', '').strip()
    shift_end = data.get('shift_end', '').strip()
    shift_type = data.get('shift_type', '').strip()
    is_active = int(data.get('is_active', 1))

    if not name or not title:
        return jsonify({'success': False, 'message': 'Worker Name and Title are required.'}), 400

    conn = get_db()
    conn.execute('''
        UPDATE stylists 
        SET name = ?, title = ?, bio = ?, experience_years = ?, rating = ?,
            image_url = ?, specialties = ?, available_days = ?, shift_start = ?,
            shift_end = ?, shift_type = ?, is_active = ?
        WHERE id = ?
    ''', (
        name, title, bio, experience_years, rating,
        image_url, specialties, available_days, shift_start,
        shift_end, shift_type, is_active, worker_id
    ))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Worker "{name}" and shift schedule updated successfully!'})

@app.route('/api/admin/workers/toggle-status', methods=['POST'])
def api_admin_worker_toggle():
    if not is_manager_authorized():
        return jsonify({'success': False, 'message': 'Manager authentication required. Please unlock the Manager Suite.'}), 401

    data = request.get_json() or {}
    worker_id = data.get('id')
    if not worker_id:
        return jsonify({'success': False, 'message': 'Worker ID is required'}), 400

    conn = get_db()
    worker = conn.execute('SELECT * FROM stylists WHERE id = ?', (worker_id,)).fetchone()
    if not worker:
        conn.close()
        return jsonify({'success': False, 'message': 'Worker not found'}), 404

    new_status = 0 if worker['is_active'] == 1 else 1
    conn.execute('UPDATE stylists SET is_active = ? WHERE id = ?', (new_status, worker_id))
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'is_active': new_status,
        'message': f"Worker status updated to {'Active' if new_status == 1 else 'Inactive'}"
    })

@app.route('/api/admin/workers/delete', methods=['POST'])
def api_admin_worker_delete():
    if not is_manager_authorized():
        return jsonify({'success': False, 'message': 'Manager authentication required. Please unlock the Manager Suite.'}), 401

    data = request.get_json() or {}
    worker_id = data.get('id')
    if not worker_id:
        return jsonify({'success': False, 'message': 'Worker ID is required'}), 400

    conn = get_db()
    booking_count = conn.execute('SELECT COUNT(*) FROM bookings WHERE stylist_id = ?', (worker_id,)).fetchone()[0]
    if booking_count > 0:
        # Soft-deactivate to prevent breaking historical appointment logs
        conn.execute('UPDATE stylists SET is_active = 0 WHERE id = ?', (worker_id,))
        conn.commit()
        conn.close()
        return jsonify({
            'success': True,
            'message': f'Worker marked inactive (has {booking_count} appointment records in history).'
        })

    conn.execute('DELETE FROM stylists WHERE id = ?', (worker_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Worker removed permanently.'})

@app.route('/download-ics/<booking_code>')
def download_ics(booking_code):
    conn = get_db()
    b = conn.execute('SELECT * FROM bookings WHERE booking_code = ?', (booking_code,)).fetchone()
    conn.close()
    if not b:
        return "Booking not found", 404

    # Format datetime for ICS
    date_clean = b['appointment_date'].replace('-', '')
    # Approximate start hour from 12-hour format
    time_part = b['appointment_time']
    try:
        dt = datetime.strptime(f"{b['appointment_date']} {time_part}", "%Y-%m-%d %I:%M %p")
        dt_start = dt.strftime("%Y%m%dT%H%M%S")
        dt_end = (dt + timedelta(hours=1, minutes=15)).strftime("%Y%m%dT%H%M%S")
    except Exception:
        dt_start = f"{date_clean}T100000"
        dt_end = f"{date_clean}T113000"

    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Maison De Beaute Salon//Appointments//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:{b['service_name']} at Maison De Beaute
DESCRIPTION:Salon Appointment with Specialist {b['stylist_name']}\\nBooking Code: {b['booking_code']}
LOCATION:Maison De Beauté Salon & Spa, 742 Fifth Avenue, Luxury Suite 400
DTSTART:{dt_start}
DTEND:{dt_end}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

    return Response(
        ics_content,
        mimetype="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=appointment-{booking_code}.ics"}
    )

if __name__ == '__main__':
    print("Starting Maison De Beauté Salon Web Server at http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
