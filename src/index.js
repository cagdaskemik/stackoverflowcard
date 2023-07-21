const widgetStyle = `

.stackoverflow {
  margin: auto;
  padding: 0.5em;
}


.so_card {
  font-family: 'Roboto', sans-serif;
  position: relative;
  border: 1px solid #efefef;
  padding: 20px;
  box-shadow: 0 0 3px rgba(0,0,0,0.2);
  display: inline-block;
  color: '#333';
  width: 100vw;
  height: 100vh;            
}

.so_logo {
  position: absolute;
  top: 5px;
  left: 5px;

  
}
.so_logo img {
    width: 20px;
}

.so_profile_picture_container {
  text-align: center;
  padding-top: 20px;
}

.so_profile_picture_container img {
    display: inline-block;
    width: 75px;
    border-radius: 50%;
    
}
.so_display_name {
  margin: 0;
  text-align: center;
  color: #666;
}

.so_content, .so_header, .so_footer {
  padding: 10px 0;
}

.so_content {
  text-align: center;
}

.so_header {
  padding-top: 0;
}

.so_footer {
  border-bottom: 0;
  padding-bottom: 0;
  text-align: center;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.so_reputation {
  font-size: 2em;
  text-align: center;
  margin: 0;
  color: #f90
}

.so_reputation_label {
  color: #777
}

.so_badges_label {
  color: #666;
  font-size: 1.3em;
  margin-right: 10px;
}

.so_badge {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 3px;
  margin-top: 5px;
}

.so_badge_wrapper {
  margin-right: 0px;
  margin-top: 5px;
}

.so_badge_gold {
  background-color: #ffcc01;
  margin-right: 12px;
  margin-top: 5px;

}
.so_badge_wrapper .gold {
  color: #ffcc01;
  padding-left: 13px;
}

.so_badge_silver {
  background-color: #9a9c9f
}

.so_badge_wrapper .silver {
  color: #9a9c9f;
  margin-left: 12px;
}

.so_badge_bronze {
  background-color: #ab825f;
  margin-left: 5px;
}

.so_badge_wrapper .bronze {
  color: #ab825f;
  margin-left: 12px;

}

.so_profile_link {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  text-decoration: none;

}
`;

// Function to format numbers into a readable format (K, Mil, Bil, Tril)
function formatNumbers(num) {
  if (!(num >= 1000)) return num;
  let newNum = num;
  let increment = 0;
  while (newNum >= 1000) {
    newNum /= 1000;
    increment += 1;
  }
  newNum = newNum.toPrecision(3);
  newNum += ["", "K", "M", "B", "T"][increment];
  return newNum;
}

// Create a template element and set its innerHTML
const template = document.createElement("template");
template.innerHTML = `
    <style>
        ${widgetStyle}
    </style>
    <div class="so_card"></div>
`;

class StackOverflowProfile extends HTMLElement {
  static get observedAttributes() {
    return ['id', 'color', 'color-secondary', 'width', 'height'];
  }

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'color' || name === 'color-secondary') {
      this.updateGradient();
    }
    if (name === 'id') {
      this.fetchAndRender();
    }
    if (name === 'width' || name === 'height') {
      this.updateSize();
    }
  }

  updateSize() {
    const width = this.getAttribute('width') || '100%';
    const height = this.getAttribute('height') || '100%';
    const card = this._shadowRoot.querySelector(".so_card");
    card.style.width = width;
    card.style.height = height;
  }

  updateGradient() {
    const color1 = this.getAttribute('color') || 'white';
    const color2 = this.getAttribute('color-secondary') || 'white';
    this._shadowRoot.querySelector(".so_card").style.background = `linear-gradient(${color1}, ${color2})`;
  }

  async fetchAndRender() {
    const id = this.getAttribute('id');
    if (!id) return;
    
    const data = await fetch(`https://api.stackexchange.com/2.2/users/${id}?site=stackoverflow`)
      .then(response => response.json())
    
    const so = data.items && data.items[0];
    this.createCard(so);
  }

  connectedCallback() {
    this.fetchAndRender();
    this.updateGradient();
    this.updateSize();
  }

  createCard(data) {
    const card = this._shadowRoot.querySelector(".so_card");
    card.innerHTML = `
      <a href=${data.link} target='_blank' class='so_profile_link' />
      <div class='so_header'>
        <span class='so_logo'>
          <img src='http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png' alt='Stackoverflow' />
        </span>
        <div class='so_profile_picture_container'>
          <img src=${data.profile_image} alt=${data.display_name} />
        </div>
        <h4 class='so_display_name'>${data.display_name}</h4>
      </div>
      <div class='so_content'>
        <p class='so_reputation'>${formatNumbers(data.reputation)}</p>
        <small class='so_reputation_label'>Stackoverflow reputation</small>
      </div>
      <div class='so_footer'>
        <span class='so_badges_label'>Badges</span>
        <span class='so_badge_wrapper'>
          <span class='so_badge so_badge_gold' />
          <span class='gold'>${data.badge_counts.gold}</span>
        </span>
        <span class='so_badge_wrapper'>
          <span class='so_badge so_badge_silver' />
          <span class='silver'>${data.badge_counts.silver}</span>
        </span>
        <span class='so_badge_wrapper'>
          <span class='so_badge so_badge_bronze' />
          <span class='bronze'>${data.badge_counts.bronze}</span>
        </span>
      </div>
    `;
  }
}

if (!customElements.get("stack-overflow-profile")) {
  customElements.define("stack-overflow-profile", StackOverflowProfile);
}
