function Topbar() {
  return (
    <header className="navbar navbar-expand-lg bg-white border-bottom sticky-top shadow-sm">
      <div className="container-fluid px-4">
        <div className="navbar-brand d-flex align-items-center gap-3">
          <span className="brand-mark rounded-3 d-inline-flex align-items-center justify-content-center">
            <i className="bi bi-layers-half text-white" />
          </span>
          <div>
            <div className="fw-semibold">Enterprise Dynamic Form Builder</div>
            <small className="text-muted">JSON-driven admin application with reusable renderer architecture</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
