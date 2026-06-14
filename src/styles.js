export const styles = {
  bodyLogin: {
    margin: 0,
    padding: 0,
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(to top, #022e61, rgb(42, 82, 168))",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  logoInternal: {
    width: "150px",
    marginBottom: "20px"
  },
  container: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    boxSizing: "border-box"
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "#fff",
    color: "#333"
  },
  iconSelect: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
    pointerEvents: "none"
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
    boxSizing: "border-box"
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#888",
    display: "flex",
    alignItems: "center"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#337ab7",
    border: "none",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "15px"
  },
  footerText: {
    fontSize: "14px",
    color: "#444",
    marginTop: "10px",
    marginBottom: "10px"
  },
  signupLink: {
    color: "#337ab7",
    textDecoration: "none",
    fontWeight: "bold"
  },
  erroTexto: {
    color: "#dc3545",
    fontSize: "13px",
    margin: "2px 0",
    fontWeight: "bold"
  },
  muralHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "65px",
    backgroundColor: "white",
    borderBottom: "1px solid #ddd",
    width: '100%',
    position: 'relative'
  },
  muralTitle: {
    fontSize: '20px',
    color: '#5f6368',
    margin: 0,
    fontWeight: '400',
    textAlign: 'center',
    flex: 1
  },
  logoutButton: {
    position: 'absolute',
    right: '20px',
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  addButton: {
    position: "fixed",
    bottom: "40px",
    right: "40px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#022e61",
    color: "white",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    zIndex: 900,
    transition: "transform 0.2s",
    outline: "none"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center"
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    padding: "30px"
  },
  muralCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #dadce0",
    cursor: "pointer",
    overflow: "hidden"
  },
  muralCardHeader: {
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end"
  },
  formLabel: {
    display: "block",
    fontSize: "14px",
    color: "#5f6368",
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: "2px"
  },
  forumContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #dadce0"
  },
  aulaCard: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fff",
    borderRadius: "6px",
    marginBottom: "10px",
    transition: "background 0.2s"
  },
  tabContainer: {
    display: "flex",
    borderBottom: "1px solid #dadce0",
    marginTop: "15px"
  },
  tabItem: {
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center"
  },
  duvidaCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    borderBottom: "1px solid #eee"
  },
  votosContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "bold"
  },
};
