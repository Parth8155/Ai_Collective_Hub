// Navbar scroll effect
function onScroll() {
    const navbar = document.getElementsByClassName("navbar")[0];
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  window.onscroll = onScroll;
  
  // Update footer year
  document.getElementById("year").textContent = new Date().getFullYear();
  
  // Trending AI Tools Data
  const trendingTools = [
    {
      name: "ChatGPT",
      description:
        "Advanced language model for natural conversations and content creation",
      image:
        "https://tse3.mm.bing.net/th?id=OIP.gVEb3Iji71hLjB77QWaflQHaEK&rs=1&pid=ImgDetMain",
      rating: 4.9,
    },
    {
      name: "DALL-E",
      description: "AI-powered image generation from textual descriptions",
      image:
        "https://tse1.mm.bing.net/th?id=OIP.lxOTftc3PlOYIK_FufdKRgHaEs&rs=1&pid=ImgDetMain",
      rating: 4.8,
    },
    {
      name: "Copilot",
      description: "AI-powered coding assistant for developers",
      image:
        "https://blog.trustedtechteam.com/static/bcf7bed1b41ce28cd8b490493f90bc1f/4fb49/copilot-is-here-hero-image.jpg",
      rating: 4.7,
    },
  ];
  
  // Populate Trending Tools
  function populateTrendingTools() {
    const container = document.getElementById("trendingTools");
    container.innerHTML = ""; // Clear existing items
    for (let i = 0; i < trendingTools.length; i++) {
      const tool = trendingTools[i];
      const toolCard = document.createElement("div");
      toolCard.className = "col-md-4";
      toolCard.innerHTML = `
        <div class="tool-card">
          <img src="${tool.image}" alt="${tool.name}" class="tool-image w-100">
          <div class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="h5 mb-0">${tool.name}</h3>
              <div class="tool-rating">
                <i class="bi bi-star-fill"></i>
                <span class="ms-1">${tool.rating}</span>
              </div>
            </div>
            <p class="text-muted mb-3">${tool.description}</p>
            <button class="btn btn-primary w-100">Learn More</button>
          </div>
        </div>
      `;
      container.appendChild(toolCard);
    }
  }
  
  // Initialize
  function onLoad() {
    populateTrendingTools();
  }
  window.onload = onLoad;
  