from app import app


def test_health_reports_process_status():
    response = app.test_client().get('/api/health')

    assert response.status_code == 200
    assert response.get_json()['status'] == 'ok'


def test_ready_checks_database_connection():
    response = app.test_client().get('/api/ready')

    assert response.status_code == 200
    assert response.get_json() == {'status': 'ready', 'database': 'ok'}


def test_login_rejects_missing_credentials():
    response = app.test_client().post('/api/user/login', json={})

    assert response.status_code == 400
    assert response.get_json() == {'msg': 'Missing email or password'}
