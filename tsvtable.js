class TsvTable extends HTMLElement {
  static get observedAttributes() {
    return ["src"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Styles
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        font-family: sans-serif;
      }
      input[type="search"] {
        margin-bottom: 8px;
        padding: 4px 6px;
        width: 100%;
        box-sizing: border-box;
        font-size: 14px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th, td {
        padding: 4px 8px;
        border: 1px solid #ccc;
      }
      th {
        cursor: pointer;
        background: #f5f5f5;
        user-select: none;
      }
      .sort-btn {
        cursor: pointer;
        font-size: 0.8em;
        margin-left: 6px;
        opacity: 0.6;
      }
      .sort-btn:hover {
        opacity: 1;
      }
      .no-results {
        padding: 8px;
        color: #777;
        font-style: italic;
      }
    `;
    this.shadowRoot.appendChild(style);

    // Search box
    this.searchInput = document.createElement("input");
    this.searchInput.type = "search";
    this.searchInput.placeholder = "Search…";
    this.searchInput.addEventListener("input", () => this.applyFilter());
    this.shadowRoot.appendChild(this.searchInput);

    // Table
    this.table = document.createElement("table");
    this.shadowRoot.appendChild(this.table);

    // State
    this.rows = [];        // raw TSV data
    this.filteredRows = []; // after search
    this.sortState = {};   // column → "asc"/"desc"
  }

  connectedCallback() {
    if (this.getAttribute("src")) {
      this.loadTsv();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "src" && newValue !== oldValue && this.isConnected) {
      this.loadTsv();
    }
  }

  async loadTsv() {
    try {
      const url = this.getAttribute("src");
      const response = await fetch(url);
      const text = await response.text();
      this.rows = this.parseTsv(text);
      this.filteredRows = this.rows; // no filter yet
      this.renderTable(this.filteredRows);
    } catch (err) {
      console.error("TSV load error:", err);
      this.table.innerHTML = "<tr><td>Error loading TSV</td></tr>";
    }
  }

  parseTsv(text) {
    return text
      .trim()
      .split("\n")
      .map(row => row.split("\t").map(cell => cell.trim()));
  }

  applyFilter() {
    const query = this.searchInput.value.toLowerCase().trim();

    if (!query) {
      this.filteredRows = this.rows;
    } else {
      const header = this.rows[0];
      const body = this.rows.slice(1);

      const filteredBody = body.filter(row =>
        row.some(cell => cell.toLowerCase().includes(query))
      );

      this.filteredRows = [header, ...filteredBody];
    }

    this.renderTable(this.filteredRows);
  }

  sortByColumn(index) {
    const header = this.filteredRows[0];
    const body = this.filteredRows.slice(1);

    // Toggle sort direction
    const current = this.sortState[index] || "none";
    const direction = current === "asc" ? "desc" : "asc";
    this.sortState[index] = direction;

    body.sort((a, b) => {
      const A = a[index];
      const B = b[index];

      const numA = parseFloat(A);
      const numB = parseFloat(B);

      if (!isNaN(numA) && !isNaN(numB)) {
        return direction === "asc" ? numA - numB : numB - numA;
      }

      return direction === "asc"
        ? A.localeCompare(B)
        : B.localeCompare(A);
    });

    this.filteredRows = [header, ...body];
    this.renderTable(this.filteredRows);
  }

  renderTable(rows) {
    if (!rows.length) {
      this.table.innerHTML = "<tr><td class='no-results'>No results</td></tr>";
      return;
    }

    const header = rows[0];
    const body = rows.slice(1);

    this.table.innerHTML = "";

    // --- Header ---
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    header.forEach((h, index) => {
      const th = document.createElement("th");

      const label = document.createElement("span");
      label.textContent = h;

      const btn = document.createElement("span");
      btn.textContent = "↕";
      btn.className = "sort-btn";
      btn.addEventListener("click", () => this.sortByColumn(index));

      th.appendChild(label);
      th.appendChild(btn);

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    this.table.appendChild(thead);

    // --- Body ---
    const tbody = document.createElement("tbody");
    body.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    this.table.appendChild(tbody);
  }
}

customElements.define("tsv-table", TsvTable);
