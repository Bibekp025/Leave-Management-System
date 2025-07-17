// Hide Approve Leaves nav-item by default with CSS to prevent flicker
(function() {
    var style = document.createElement('style');
    style.id = 'approveLeaveNavStyle';
    style.innerHTML = '#approveLeaveNav { display: none !important; }';
    document.head.appendChild(style);
})();

function showApproveLeaveNavForTeacherOrHR() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;
    fetch('http://127.0.0.1:8000/user/self/', {
        headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => res.json())
    .then(user => {
        const approveNav = document.getElementById('approveLeaveNav');
        const styleElem = document.getElementById('approveLeaveNavStyle');
        if (!approveNav) return;
        if (user.category === 'teacher' || user.category === 'hr') {
            if (styleElem) styleElem.remove(); // Remove the injected style
            approveNav.style.display = 'flex'; // match sidebar layout
        } else {
            approveNav.style.display = 'none';
        }
    });
}
document.addEventListener('DOMContentLoaded', showApproveLeaveNavForTeacherOrHR); 