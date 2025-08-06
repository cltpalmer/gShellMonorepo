import '../styles/IntegrationPage.css';
import { useEffect, useState } from "react";
import viewIcon from "../assets/view.svg";
import deleteIcon from "../assets/trash.svg";
import editIcon from "../assets/edit.svg";

export default function IntegrationsPage() {
  const [cards, setCards] = useState([]);
  const baseURL = "https://gshell.cloud";

  useEffect(() => {
    async function fetchIntegrations() {
      const res = await fetch(`${baseURL}/read?account=main&sheetId=1R69hj9c3uyZAo_695Psn2WgntnkUSJawIS6utAFeKFw&range=Integrations!A1:C10`);
      const json = await res.json();
      if (json.success) {
        const rows = json.data.slice(1); // skip header
        let mapped = rows.map((row, i) => ({
          id: i,
          title: row[0],
        }));
      
        const perRow = 5;
        const remainder = mapped.length % perRow;
        if (remainder !== 0) {
          const emptySlots = perRow - remainder;
          for (let i = 0; i < emptySlots; i++) {
            mapped.push({ id: `empty-${i}`, title: "", isEmpty: true });
          }
        }
      
        setCards(mapped);
      }      
    }

    fetchIntegrations();
  }, []);

  return (
    <div className="integrations-page">
      <div className="integration-whole">
      <h1 className="integration-title">
  &lt; your <span className="highlight-word">integrations.</span> &gt;
</h1>
<input className="integration-search" type="text" placeholder="Search..." />

        <div className="integrations-grid">
            
          {cards.map(({ id, title, isEmpty }) => (
            <div key={id} className={`integration-card ${isEmpty ? 'empty-card' : ''}`}>
              {isEmpty ? ( 
                <div className="empty-card-content">
                  <p className="empty-message">+</p>
                </div>
              ) : ( 
                <>
                  <div className="integration-card-header">
                    <h2 className="integration-name">{title}</h2>
                  </div>
                  <div className="integration-button-row">
                    <button className="integration-button view-button">
                      <img src={viewIcon} alt="View" />
                    </button>

                    <button className="integration-button edit-button">
                      <img src={editIcon} alt="Edit" />
                    </button>

                    <button className="integration-button delete-button">
                      <img src={deleteIcon} alt="Delete" />
                    </button>

                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
