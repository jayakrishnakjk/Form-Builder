import { NavLink, Outlet } from 'react-router-dom';
import Topbar from '../components/common/Topbar';

function AdminLayout() {
  return (
    <div className="app-shell bg-body-tertiary min-vh-100">
      {/* <Topbar /> */}
      <div className="container-fluid py-3">
        <div className="row g-3 align-items-start">
          <aside className="col-12 col-lg-2">
            <div className="card border-0 shadow-sm sticky-lg-top" style={{ top: '90px' }}>
              <div className="card-body">
                <h6 className="text-uppercase text-muted small mb-3">Admin Console</h6>
                <nav className="nav nav-pills flex-column gap-2">
                  <NavLink className="nav-link" to="/builder/new">
                    <i className="bi bi-plus-square me-2" />New Builder
                  </NavLink>
                </nav>
              </div>
            </div>
          </aside>
          <main className="col-12 col-lg-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
