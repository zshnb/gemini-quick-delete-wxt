function App() {

  return (
    <div style={{textAlign: 'center', padding: '16px'}}>
      <div style={{margin: '40px 0'}}>
        <img src="/icon-128.png" alt="icon" width={90} />
      </div>
      <h2 style={{margin: '0 35px'}}>{browser.i18n.getMessage('popup_title')}</h2>

      <div style={{display: 'flex', justifyContent: 'center', gap: '16px', margin: '40px 0'}}>
        <a 
          href="https://chromewebstore.google.com/detail/gemini-chat-quick-delete/njijiekknnohfddbmgpgepnedbogejhm?hl=en-US&utm_source=ext_sidebar"
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#F7F7F7',
            color: '#686868',
            textDecoration: 'none',
            borderRadius: '1px',
            fontWeight: "bold"
          }}
        >
          {browser.i18n.getMessage('rate_button')}
        </a>
        <a 
          href="mailto:a857681664@gmail.com"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#F7F7F7',
            color: '#686868',
            textDecoration: 'none',
            borderRadius: '1px',
            fontWeight: "bold"
          }}
        >
          {browser.i18n.getMessage('feedback_button')}
        </a>
      </div>
    </div>
  );
}

export default App;
