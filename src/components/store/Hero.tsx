/* eslint-disable @next/next/no-img-element */

export function Hero() {
  return (
    <main className="container hero-container">
      <div className="hero-text">
        <b>Unlock Your Inner</b>
        <br />
        <b id="a">GAMER</b>
        <br />
        <b style={{ marginLeft: 20 }}>With Us.</b>
        <div className="mt-4">
          <a href="#featured-products" className="btn btn-danger px-4 py-2 fw-bold">
            Explore Store ↓
          </a>
        </div>
      </div>

      <div className="class6 d-none d-lg-block">
        <img src="/charac5.png" alt="Gaming Character" />
        <img id="c" src="/bullet.png" alt="Bullet effect" />
      </div>

      <div className="char-group">
        <div className="class2">
          <img src="/charac3.png" height="385" alt="Gaming Hero 1" />
        </div>
        <div className="class1">
          <img src="/char_2.png" height="360" alt="Gaming Hero 2" />
        </div>
        <div className="class3">
          <img src="/charac.png" height="360" alt="Gaming Hero 3" />
        </div>
        <div className="class4">
          <img src="/charac4.png" height="360" alt="Gaming Hero 4" />
        </div>
      </div>
    </main>
  );
}
