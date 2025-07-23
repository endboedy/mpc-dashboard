document.addEventListener("DOMContentLoaded", function () {
  const toggleSidebarBtn = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");

  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
    });
  }

  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach(item => {
    item.addEventListener("click", function () {
      const submenu = item.nextElementSibling;
      if (submenu && submenu.classList.contains("submenu")) {
        submenu.classList.toggle("show");
      }
    });
  });
});
