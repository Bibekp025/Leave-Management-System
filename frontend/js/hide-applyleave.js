// Hide Apply Leave nav-item by default with CSS to prevent flicker
(function() {
    var style = document.createElement('style');
    style.id = 'applyLeaveNavStyle';
    style.innerHTML = '#applyLeaveNav { display: none !important; }';
    document.head.appendChild(style);
})();

function showApplyLeaveNavForStudentOrTeacher() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;
    fetch('http://127.0.0.1:8000/user/self/', {
        headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => res.json())
    .then(user => {
        const applyNav = document.getElementById('applyLeaveNav');
        const styleElem = document.getElementById('applyLeaveNavStyle');
        const dashboardBtn = document.getElementById('dashboardApplyLeaveBtn');
        const body = document.body;
        if (!applyNav) return;
        if (user.category === 'student' || user.category === 'teacher') {
            if (styleElem) styleElem.remove(); // Remove the injected style
            applyNav.style.display = 'flex'; // match sidebar layout
            if (dashboardBtn) dashboardBtn.style.display = '';
            if (body.classList.contains('hr-user')) body.classList.remove('hr-user');
        } else {
            applyNav.style.display = 'none';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (!body.classList.contains('hr-user')) body.classList.add('hr-user');
        }
    });
}
document.addEventListener('DOMContentLoaded', showApplyLeaveNavForStudentOrTeacher); 