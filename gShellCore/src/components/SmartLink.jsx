import React from 'react';

export default function SmartLinkConfigBox({
    enableSmartLink,
    setEnableSmartLink,
    linkTargetSheet,
    setLinkTargetSheet,
    linkIdentifier,
    setLinkIdentifier,
    linkDisplayFields,
    setLinkDisplayFields,
    appName,
    sheets,
    availableFields,
    setAvailableFields,
    columnsOfSheet,
    storeMode,
    setStoreMode
}) {
    
    // Handle sheet selection and load its columns
    const handleSheetChange = async (selectedSheet) => {
        console.log("🔄 Sheet selected:", selectedSheet);
        setLinkTargetSheet(selectedSheet);
        
        if (selectedSheet && columnsOfSheet) {
            try {
                console.log("🔄 Fetching columns for:", selectedSheet);
                const fields = await columnsOfSheet(appName, selectedSheet);
                console.log("📋 Received fields:", fields);
                setAvailableFields(fields || []);
                // Reset selections when changing sheets
                setLinkIdentifier("");
                setLinkDisplayFields([]);
            } catch (error) {
                console.error("❌ Error fetching columns:", error);
                setAvailableFields([]);
            }
        } else {
            setAvailableFields([]);
            setLinkIdentifier("");
            setLinkDisplayFields([]);
        }
    };

    const toggleDisplayField = (field) => {
        setLinkDisplayFields(prev => 
            prev.includes(field) 
                ? prev.filter(f => f !== field)
                : [...prev, field]
        );
    };

    const styles = {
        container: {
            marginTop: "1rem",
            padding: "1.5rem",
            border: "2px solid #e1e5e9",
            borderRadius: "12px",
            backgroundColor: "#f8f9fa",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        },
        enableToggle: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#2d3748",
            marginBottom: "1.5rem",
            cursor: "pointer"
        },
        checkbox: {
            width: "18px",
            height: "18px",
            accentColor: "#3182ce"
        },
        section: {
            marginBottom: "1.5rem"
        },
        label: {
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#4a5568",
            marginBottom: "8px"
        },
        select: {
            width: "100%",
            padding: "10px 12px",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "14px",
            backgroundColor: "white",
            color: "#2d3748",
            cursor: "pointer",
            transition: "border-color 0.2s ease"
        },
        selectFocus: {
            borderColor: "#3182ce",
            outline: "none"
        },
        fieldGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginTop: "12px"
        },
        fieldItem: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            backgroundColor: "white",
            cursor: "pointer",
            transition: "all 0.2s ease",
            userSelect: "none"
        },
        fieldItemSelected: {
            backgroundColor: "#ebf8ff",
            borderColor: "#3182ce",
            boxShadow: "0 0 0 1px #3182ce20"
        },
        fieldCheckbox: {
            width: "16px",
            height: "16px",
            accentColor: "#3182ce"
        },
        fieldText: {
            fontSize: "14px",
            fontWeight: "500",
            color: "#2d3748"
        },
        identifierSelect: {
            backgroundColor: linkIdentifier ? "#f0fff4" : "white",
            borderColor: linkIdentifier ? "#38a169" : "#e2e8f0"
        },
        selectedCount: {
            fontSize: "12px",
            color: "#718096",
            fontStyle: "italic",
            marginTop: "8px"
        },
        debugSection: {
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f7fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "6px"
        },
        debugContent: {
            fontSize: "11px",
            fontFamily: "Monaco, Consolas, monospace",
            color: "#4a5568",
            whiteSpace: "pre-wrap"
        }
    };

    return (
        <div style={styles.container}>
            <label style={styles.enableToggle}>
                <input
                    type="checkbox"
                    checked={enableSmartLink}
                    onChange={(e) => setEnableSmartLink(e.target.checked)}
                    style={styles.checkbox}
                />
                <span>🔗 Enable SmartLink</span>
            </label>

            {enableSmartLink && (
                <>
                    <div style={styles.section}>
                        <label style={styles.label}>📄 Target Sheet</label>
                        <select
                            value={linkTargetSheet}
                            onChange={(e) => handleSheetChange(e.target.value)}
                            style={styles.select}
                        >
                            <option value="">-- Select Sheet --</option>
                            {sheets.map((sheet) => (
                                <option key={sheet} value={sheet}>{sheet}</option>
                            ))}
                        </select>
                    </div>

                    {linkTargetSheet && availableFields.length > 0 && (
                        <>
                            <div style={styles.section}>
                                <label style={styles.label}>🔑 Identifier Column</label>
                                <select
                                    value={linkIdentifier}
                                    onChange={(e) => setLinkIdentifier(e.target.value)}
                                    style={{...styles.select, ...styles.identifierSelect}}
                                >
                                    <option value="">-- Select Identifier Column --</option>
                                    {availableFields.map((field) => (
                                        <option key={field} value={field}>{field}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.section}>
                                <label style={styles.label}>
                                    🎯 Display Fields 
                                    <span style={{fontWeight: "normal", color: "#718096"}}> (optional)</span>
                                </label>
                                
                                <div style={styles.fieldGrid}>
                                    {availableFields.map((field) => {
                                        const isSelected = linkDisplayFields.includes(field);
                                        return (
                                            <div
                                                key={field}
                                                style={{
                                                    ...styles.fieldItem,
                                                    ...(isSelected ? styles.fieldItemSelected : {})
                                                }}
                                                onClick={() => toggleDisplayField(field)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}} // Handled by parent div click
                                                    style={styles.fieldCheckbox}
                                                />
                                                <span style={styles.fieldText}>{field}</span>
                                                {isSelected && <span style={{color: "#38a169", fontSize: "12px"}}>✓</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {linkDisplayFields.length > 0 && (
                                    <div style={styles.selectedCount}>
                                        Selected {linkDisplayFields.length} field{linkDisplayFields.length !== 1 ? 's' : ''}: {linkDisplayFields.join(', ')}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {linkTargetSheet && availableFields.length === 0 && (
                        <div style={{
                            padding: "1rem",
                            backgroundColor: "#fef5e7",
                            border: "1px solid #f6ad55",
                            borderRadius: "8px",
                            color: "#744210",
                            fontSize: "14px"
                        }}>
                            ⚠️ No columns found in selected sheet. Make sure the sheet has data and columns defined.
                        </div>
                    )}
                </>
            )}

            {/* Debug section - remove in production */}
            <details style={styles.debugSection}>
                <summary style={{cursor: "pointer", fontWeight: "600", color: "#4a5568"}}>
                    🐛 Debug SmartLink Configuration
                </summary>
                <div style={styles.debugContent}>
                    {JSON.stringify({
                        enableSmartLink,
                        linkTargetSheet,
                        linkIdentifier,
                        linkDisplayFields,
                        availableFields,
                        sheets,
                        selectedDisplayCount: linkDisplayFields.length
                    }, null, 2)}
                </div>
            </details>
        </div>
    );
}