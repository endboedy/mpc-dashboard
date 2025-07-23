
document.querySelectorAll('.sidebar ul li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar ul li').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
    });
});
