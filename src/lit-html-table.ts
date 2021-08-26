import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

type ObjectData = { [key: string]: any };


@customElement("lit-html-table")
export class LitHtmlTable extends LitElement {
  @property() src = "";
  @property() values: ObjectData[] = [];
  @property({ type: Boolean }) editable = false;

  data?: ObjectData[];

  static styles = css`
    tr {
      text-align: var(--table-tr-text-align, left);
      vertical-align: var(--table-tr-vertical-align, top);
      padding: var(--table-tr-padding, 10px); 
    }
  `;

  render() {
    // Check if data is loaded
    if (!this.values) {
      return html`<slot name="loading">Loading...</slot>`;
    }
    // Check if items are not empty
    if (this.values.length === 0) {
      return html`<slot name="empty">No Items Foundvv!</slot>`;
    }
    // Convert JSON to HTML Table
    return html`
      <table>
        <thead>
          <tr>
            ${Object.keys(this.values[0]).map((key) => {
              const name = key.replace(/\b([a-z])/g, (_, val) =>
                val.toUpperCase()
              );
              return html`<th>
                <slot name="${key}">${name}</slot>
              </th>`;
            })}
          </tr>
        </thead>
        <tbody>
        ${this.values.map((item, index) => {
          return html`
            <tr>
              ${Object.entries(item).map((row) => {
                return html`<td>
                  ${this.editable
                    ? html`<input
                        value="${row[1]}"
                        type="text"
                        @input=${(e: any) => {
                          const value = e.target.value;
                          const key = row[0];
                          const current = this.values![index];
                          current[key] = value;
                          this.values![index] = current;
                          this.requestUpdate();
                          this.dispatchEvent(
                            new CustomEvent("input-cell", {
                              detail: {
                                index: index,
                                data: current,
                              },
                            })
                          );
                        }}
                      />`
                    : html`${row[1]}`}
                </td>`;
              })}
            </tr>
          `;
        })}
      </tbody>
      </table>
      <input type="button" value="new" @click="${this.addNew}"/>
    `;
  }

  async firstUpdated() {
    await this.fetchData();
  }

  // Download the latest json and update it locally
  async fetchData() {
    let _data: any;
    if (this.src.length > 0) {
      // If a src attribute is set prefer it over any slots
      _data = await fetch(this.src).then((res) => res.json());
    } else {
      // If no src attribute is set then grab the inline json in the slot
      const elem = this.parentElement?.querySelector(
        'script[type="application/json"]'
      ) as HTMLScriptElement;
      if (elem) _data = JSON.parse(elem.innerHTML);
    }
    this.values = this.transform(_data ?? []);
    this.requestUpdate();
  }

  transform(data: any) {
    return data;
  }

  addNew() {
    console.log("adding new line");
    let line:ObjectData = { key:"2",name:"huhuu",date:"13.4.2021",time:"21:34"};
    this.values.push( line);
    this.requestUpdate();
  }
}