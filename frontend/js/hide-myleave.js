// Hide My Leave nav-item by default with CSS to prevent flicker
(function() {
    var style = document.createElement('style');
    style.id = 'myLeaveNavStyle';
    style.innerHTML = '#myLeaveNav { display: none !important; }';
    document.head.appendChild(style);
})();

function showMyLeaveNavForStudentOrTeacher() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;
    fetch('http://127.0.0.1:8000/user/self/', {
        headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => res.json())
    .then(user => {
        const myLeaveNav = document.getElementById('myLeaveNav');
        const styleElem = document.getElementById('myLeaveNavStyle');
        if (!myLeaveNav) return;
        if (user.category === 'student' || user.category === 'teacher') {
            if (styleElem) styleElem.remove(); // Remove the injected style
            myLeaveNav.style.display = 'flex'; // match sidebar layout
        } else {
            myLeaveNav.style.display = 'none';
        }
    });
}
document.addEventListener('DOMContentLoaded', showMyLeaveNavForStudentOrTeacher); 