const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">CodeQuiz</span>
            <p>Level-based coding quizzes for students and self-learners.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <p>rabiaabbas448@gmail.com</p>
            <p>Lahore, Pakistan</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CodeQuiz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;