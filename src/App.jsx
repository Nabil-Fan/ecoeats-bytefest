import { useEffect, useState, useRef } from 'react'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useCounters() {
  useEffect(() => {
    const counters = document.querySelectorAll('[data-count]')
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10)
      const duration = 1400
      const start = performance.now()
      function tick(now) {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = Math.floor(eased * target).toLocaleString('id-ID')
        if (p < 1) requestAnimationFrame(tick)
        else el.textContent = target.toLocaleString('id-ID')
      }
      requestAnimationFrame(tick)
    }
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target)
            cio.unobserve(e.target)
          }
        })
      },
      { threshold: 0.4 }
    )
    counters.forEach((c) => cio.observe(c))
    return () => cio.disconnect()
  }, [])
}

function useTilt() {
  useEffect(() => {
    const handleMove = (e) => {
      const card = e.target.closest && e.target.closest('.tilt')
      document.querySelectorAll('.tilt').forEach((el) => {
        if (el !== card) el.style.transform = ''
      })
      if (!card) return
      const rect = card.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const rotateX = (0.5 - py) * 14
      const rotateY = (px - 0.5) * 14
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`
    }
    document.addEventListener('mousemove', handleMove)
    return () => document.removeEventListener('mousemove', handleMove)
  }, [])
}

function usePrintedDigits(text, stepMs = 90, startDelayMs = 550) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    let i = 0
    let timer
    const startTimer = setTimeout(() => {
      timer = setInterval(() => {
        i += 1
        setShown(i)
        if (i >= text.length) clearInterval(timer)
      }, stepMs)
    }, startDelayMs)
    return () => { clearTimeout(startTimer); clearInterval(timer) }
  }, [text, stepMs, startDelayMs])
  return text.slice(0, shown)
}

function useCountdown(deadlineHHMM) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const compute = () => {
      const [h, m] = deadlineHHMM.split(':').map(Number)
      const now = new Date()
      const target = new Date()
      target.setHours(h, m, 0, 0)
      let diff = target - now
      if (diff < 0) diff += 24 * 60 * 60 * 1000
      const hrs = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      setLabel(hrs > 0 ? `${hrs}j ${mins}m lagi` : `${mins}m lagi`)
    }
    compute()
    const id = setInterval(compute, 30000)
    return () => clearInterval(id)
  }, [deadlineHHMM])
  return label
}

function useLiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB')
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])
  return time
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  )
}

/* Deterministic "barcode" strip — turns any string into a row of bars. */
function Barcode({ seed = 'ECOEATS', height = 30, caption }) {
  const bars = []
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  for (let i = 0; i < 28; i++) {
    hash = (hash * 1103515245 + 12345) >>> 0
    const w = 1 + (hash % 3)
    bars.push(w)
  }
  return (
    <div>
      <div className="barcode mono" style={{ height }} aria-hidden="true">
        {bars.map((w, i) => (
          <span className="bar" key={i} style={{ width: w, height: '100%' }} />
        ))}
      </div>
      {caption && <div className="barcode-caption">{caption}</div>}
    </div>
  )
}

const NAV_ITEMS = [
  { href: '#masalah', label: 'Masalah' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#dampak-sdg', label: 'Dampak SDGs' },
  { href: '#temukan', label: 'Temukan Makanan' },
]

function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="site">
        <div className="nav">
          <div className="brand"><span className="mark" />EcoEats</div>
          <nav className="links">
            {NAV_ITEMS.map((n) => (
              <a key={n.href} href={n.href}>{n.label}</a>
            ))}
          </nav>
          <button className="nav-cta">Gabung Sekarang</button>
          <button
            className={`nav-toggle ${open ? 'open' : ''}`}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span><span></span>
          </button>
        </div>
      </header>
      <div className={`nav-drawer ${open ? 'open' : ''}`}>
        <nav>
          {NAV_ITEMS.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>
          ))}
        </nav>
      </div>
    </>
  )
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  )
}

function useParallaxTilt(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const isTouch = window.matchMedia('(hover: none)').matches
    let raf
    let pointerActive = false
    let pointerX = 0.5
    let pointerY = 0.5
    const start = performance.now()

    const applyTilt = (idleRx, idleRy) => {
      const rx = idleRx + (pointerActive ? -pointerY * 10 : 0)
      const ry = idleRy + (pointerActive ? (pointerX - 0.5) * 10 : 0)
      el.style.setProperty('--tilt-x', `${rx}deg`)
      el.style.setProperty('--tilt-y', `${ry}deg`)
      el.style.setProperty('--shadow-x', `${ry * 1.8}px`)
      el.style.setProperty('--shadow-y', `${-rx * 1.4}px`)
      el.style.setProperty('--sheen-x', `${50 + ry * 3}%`)
      el.style.setProperty('--sheen-y', `${50 + rx * 3}%`)
    }

    const loop = (now) => {
      const t = (now - start) / 1000
      const idleRx = Math.sin(t * 0.6) * (isTouch ? 5 : 2.2)
      const idleRy = Math.cos(t * 0.5) * (isTouch ? 7 : 2.4)
      applyTilt(idleRx, idleRy)
      raf = requestAnimationFrame(loop)
    }

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      pointerX = (e.clientX - rect.left) / rect.width
      pointerY = (e.clientY - rect.top) / rect.height
      pointerActive = true
    }
    const handleLeave = () => {
      pointerActive = false
      el.style.setProperty('--shadow-x', '0px')
      el.style.setProperty('--shadow-y', '0px')
    }

    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [ref])
}

/* Digit-by-digit "cash-register printing" reveal for the hero's
   headline impact number. Runs once on mount. */
function Hero() {
  const printed = usePrintedDigits('12,4 KG', 80, 650)
  const liveTime = useLiveClock()
  const stageRef = useRef(null)
  useParallaxTilt(stageRef)

  return (
    <>
      <section className="hero-v2" ref={stageRef}>
        <div className="hero-v2-inner wrap">
          <div className="hero-receipt-slot" aria-hidden="false">
            <div className="hero-receipt-3d-stage">
              <div className="hero-receipt-shadow-layer" aria-hidden="true"></div>
              <div className="hero-receipt">
                <div className="hero-receipt-sheen" aria-hidden="true"></div>
                <div className="receipt hero-receipt-core">
                <div className="hero-receipt-sweep" aria-hidden="true"></div>
                <div className="hero-receipt-head">
                  <span className="mono live-tag">
                    <span className="live-dot" aria-hidden="true" />
                    {liveTime}
                  </span>
                  <span className="mono">SOLO, JAWA TENGAH</span>
                </div>
                <div className="hero-receipt-big">
                  <span className="mono">{printed}</span>
                  <span className="hero-receipt-cursor" aria-hidden="true" />
                </div>
                <div className="hero-receipt-caption mono">BISA DISELAMATKAN — KALAU ADA YANG MENJEMBATANI</div>

                <div className="hero-receipt-items">
                  <div className="hero-receipt-item">
                    <span>Roti Ibu Sri</span><span className="mono">sisa perkiraan</span>
                  </div>
                  <div className="hero-receipt-item">
                    <span>Warung Bu Marni</span><span className="mono">sisa perkiraan</span>
                  </div>
                  <div className="hero-receipt-item">
                    <span>Kedai Kopi Solo</span><span className="mono">sisa perkiraan</span>
                  </div>
                  <div className="hero-receipt-item">
                    <span>+ 12 merchant lainnya</span><span className="mono">sisa perkiraan</span>
                  </div>
                </div>

                <div className="hero-receipt-total">
                  <span>TOTAL POTENSI</span>
                  <span className="mono">12,4 KG</span>
                </div>

            <div className="hero-tear-zone hero-tear-zone-auto">
                  <div className="hero-tear-halves" aria-hidden="true">
                    <span className="tear-half tear-half-top"></span>
                    <span className="tear-half tear-half-bottom"></span>
                  </div>
                  <div className="tear-reveal-strip mono" aria-hidden="true">✂ TERSOBEK — SIAP DISELAMATKAN</div>
                  <button className="hero-tear-cta">
                    <span>Sobek Nota &amp; Lihat Potensi</span>
                    <Arrow />
                  </button>
                </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="hero-copy">
            <span className="eyebrow eyebrow-dark">SDG 1 · 10 · 13 — Solo, Jawa Tengah</span>
            <h1 className="hero-v2-h1">
              Rezeki ini masih bisa <span className="stamp-word">diselamatkan</span>, bukan dibuang.
            </h1>
            <p className="lede lede-dark">
              Setiap malam, warung dan gerobak di Solo menutup lapak dengan stok yang sebenarnya masih layak dimakan. Bukan karena tak ada yang mau — tapi karena tak ada yang tahu, dan tak ada yang menjembatani.
            </p>
            <a href="#" className="hero-secondary-btn">Daftar Jadi Merchant</a>
          </div>
        </div>
      </section>
      <Marquee />
    </>
  )
}

function Marquee() {
  const text = 'SELAMATKAN SEBELUM TERBUANG · MAKAN ENAK, HARGA HEMAT · RP0 RUGI UNTUK MERCHANT · SATU PORSI, SATU AKSI NYATA'
  return (
    <div className="marquee">
      <div className="marquee-track">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  )
}

/* ============================================================
   DAMPAK SDG — Theory of Change dibungkus sebagai "receipt".
   ============================================================ */
const FLOW_STEPS = [
  {
    icon: '🍱',
    title: 'Merchant punya stok surplus',
    body: 'Warung & gerobak di Solo menutup lapak dengan makanan yang masih layak, tapi tak terjual.',
  },
  {
    icon: '🔄',
    title: 'EcoEats menjembatani',
    body: 'Stok surplus dipasang jadi listing berdiskon, ditemukan orang di sekitar sebelum jam tutup.',
  },
  {
    icon: '🛍️',
    title: 'Konsumen membeli lebih hemat',
    body: 'Makanan layak dengan harga miring, terjangkau untuk lebih banyak kalangan.',
  },
  {
    icon: '🌱',
    title: 'Sampah organik berkurang',
    body: 'Satu porsi yang terjual adalah satu porsi yang tidak berakhir di TPA.',
  },
]

const FLOW_TAGS = [
  { id: 'sdg-1', n: '1', label: 'SDG 1 · Tanpa Kemiskinan' },
  { id: 'sdg-10', n: '10', label: 'SDG 10 · Kesenjangan' },
  { id: 'sdg-13', n: '13', label: 'SDG 13 · Perubahan Iklim' },
]

const SDG_DETAILS = [
  { id: 'sdg-1', n: '1', title: 'Tanpa Kemiskinan', body: 'Merchant UMKM tetap dapat pemasukan dari stok yang tadinya akan jadi kerugian penuh.' },
  { id: 'sdg-10', n: '10', title: 'Berkurangnya Kesenjangan', body: 'Harga lebih hemat membuka akses makanan layak bagi lebih banyak kalangan di Solo.' },
  { id: 'sdg-13', n: '13', title: 'Penanganan Perubahan Iklim', body: 'Mengurangi limbah makanan berarti turut mengurangi emisi gas rumah kaca sepanjang rantai pangan.', evidence: 'UNEP Food Loss and Waste Overview' },
]

function DampakSDG() {
  return (
    <section className="sdg-band" id="dampak-sdg">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="kicker">Bagaimana EcoEats menghasilkan dampak</span>
          <h2>Satu porsi diselamatkan, tiga dampak yang tersambung.</h2>
          <p>Ini bukan tiga hal yang berdiri sendiri. Satu memicu yang lain — dari stok yang tadinya akan dibuang, sampai ke sampah organik yang tidak jadi ada.</p>
        </div>

        <div className="flow-receipt-wrap reveal">
          <div className="bezel"><div className="bezel-core receipt flow-receipt">
            <div className="flow-head mono">RESCUE IMPACT RECEIPT</div>
            {FLOW_STEPS.map((step, i) => (
              <div className="flow-item" key={step.title}>
                <div className="flow-row">
                  <span className="flow-icon" aria-hidden="true">{step.icon}</span>
                  <div className="flow-copy">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </div>
                {i < FLOW_TAGS.length && (
                  <div className="flow-connector">
                    <span className="flow-connector-line" aria-hidden="true" />
                    <span className={`flow-sdg-tag ${FLOW_TAGS[i].id}`}>{FLOW_TAGS[i].label}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="flow-total">
              <span>Hasil akhir</span>
              <span className="mono">SDG 1 · 10 · 13 tercapai</span>
            </div>
          </div></div>
        </div>

        <div className="sdg-grid">
          {SDG_DETAILS.map((g) => (
            <div className={`sdg-card ${g.id} reveal`} key={g.id}>
              <span className="sdg-num mono">{g.n}</span>
              <div>
                <h3>{g.title}</h3>
                <p>{g.body}</p>
                {g.evidence && <p className="mono" style={{ marginTop: 8, fontSize: '0.82rem' }}>{g.evidence}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Masalah() {
  return (
    <section className="masalah" id="masalah">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="kicker">Kenapa ini penting</span>
          <div className="mono" style={{ marginTop: 10, marginBottom: 8, fontSize: '0.82rem', letterSpacing: '0.2em' }}>Ilustrasi kasus</div>
          <h2>Malam ini, ada warung yang menutup lapak sambil menghitung kerugian yang sebenarnya bisa dihindari.</h2>
          <p>
            Bu Marni tutup warung jam 8 malam. Sisa nasi sayur yang tidak laku, biasanya dia bawa pulang untuk dimakan sendiri esok — kalau masih layak. Kalau tidak, ya dibuang. Bukan karena dia tidak peduli, tapi karena tidak ada cara lain menjualnya sebelum basi.
          </p>
          <p>
            Cerita seperti ini terjadi di ratusan warung dan gerobak di Solo, setiap malam. Di saat yang sama, 783 juta orang mengalami kelaparan pada saat lebih dari 1 miliar makanan dibuang setiap hari.
          </p>
        </div>
        <div className="stat-receipt reveal">
          <div className="stat-line">
            <span className="tag mono">01</span>
            <span className="cap">Dunia membuang sekitar 1,05 miliar ton makanan pada tahun 2022, setara hampir 19% makanan yang tersedia bagi konsumen.</span>
            <span className="big">1,05 miliar ton</span>
          </div>
          <div className="stat-line">
            <span className="tag mono">02</span>
            <span className="cap">Jumlah orang yang mengalami kelaparan di dunia pada saat food waste terjadi dalam skala besar.</span>
            <span className="big">783 juta</span>
          </div>
          <div className="stat-line">
            <span className="tag mono">03</span>
            <span className="cap">EcoEats dirancang untuk mendukung upaya pengurangan food waste melalui redistribusi makanan surplus di tingkat merchant lokal.</span>
            <span className="big">Prototype Ready</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function CaraKerja() {
  const steps = [
    {
      n: '01',
      title: 'Warung kasih tahu, bukan “unggah stok”',
      body: 'Menjelang tutup, merchant tinggal masukkan apa yang masih tersisa — harga diskon, jam terakhir bisa diambil. Dua menit, selesai.',
    },
    {
      n: '02',
      title: 'Pembeli menemukan, bukan “mencari di sistem”',
      body: 'Orang yang lapar dan ingin hemat tinggal buka EcoEats, lihat apa yang tersedia di sekitarnya malam ini — bukan menu yang sama setiap hari, tapi sisa hari itu juga.',
    },
    {
      n: '03',
      title: 'Diambil, dimakan, tidak jadi sampah',
      body: 'Sesuai jadwal yang dijanjikan. Sederhana — tapi itu satu porsi yang tadinya akan dibuang, sekarang benar-benar dimakan.',
    },
  ]
  return (
    <section id="cara-kerja">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="kicker">Bagaimana EcoEats menjembatani</span>
          <h2>Bukan aplikasi rumit. Cuma jembatan yang selama ini belum ada.</h2>
          <p>EcoEats tidak mengubah cara Bu Marni jualan. Dia tetap masak seperti biasa, tetap buka warung seperti biasa. Yang berubah cuma satu: sekarang ada tempat untuk bilang “masih ada sisa, mau?” — dan ada orang yang menjawab “iya, aku mau.”</p>
        </div>
        <div className="steps">
          {steps.map((s) => (
            <div className="step reveal" key={s.n}>
              <span className="num mono">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FOOD_ITEMS = [
  { code: '#EC-0417', merchant: 'Roti Ibu Sri', name: 'Roti Tawar Gandum', now: 'Rp7.500', was: 'Rp15.000', disc: '-50%', desc: 'Sisa produksi hari ini, tetap segar hingga besok pagi.', category: 'Roti & Kue', pickupStart: '19:00', pickupBy: '20:00', rating: 4.9, distance: '600 m', stock: 3, halal: true },
  { code: '#EC-0418', merchant: 'Warung Bu Marni', name: 'Paket Nasi Sayur', now: 'Rp9.000', was: 'Rp15.000', disc: '-40%', desc: 'Menu rumahan siap santap, tersedia menjelang tutup warung.', category: 'Makanan Berat', pickupStart: '20:00', pickupBy: '21:00', rating: 4.8, distance: '850 m', stock: 5, halal: true },
  { code: '#EC-0419', merchant: 'Kedai Kopi Solo', name: 'Pastry Surplus Sore', now: 'Rp6.500', was: 'Rp10.000', disc: '-35%', desc: 'Croissant dan roti manis sisa penjualan sore hari.', category: 'Roti & Kue', pickupStart: '18:30', pickupBy: '19:30', rating: 4.6, distance: '1,2 km', stock: 4, halal: false },
  { code: '#EC-0420', merchant: 'Dapur Ibu Wati', name: 'Nasi Liwet Kemasan', now: 'Rp10.000', was: 'Rp18.000', disc: '-44%', desc: 'Nasi liwet khas Solo, dimasak pagi dan dikemas rapi.', category: 'Makanan Berat', pickupStart: '21:00', pickupBy: '22:00', rating: 5.0, distance: '450 m', stock: 2, halal: true },
  { code: '#EC-0421', merchant: 'Angkringan Pak Joyo', name: 'Es Teh & Wedang Sisa Stok', now: 'Rp3.000', was: 'Rp6.000', disc: '-50%', desc: 'Minuman kemasan botol, stok lebih dari jualan sore.', category: 'Minuman', pickupStart: '22:00', pickupBy: '23:00', rating: 4.7, distance: '700 m', stock: 8, halal: true },
]
const CATEGORIES = ['Semua', 'Roti & Kue', 'Makanan Berat', 'Minuman']

/* Deterministic fake-QR — same seeded-hash approach as Barcode,
   just laid out as a square module grid instead of a bar row. */
function FakeQR({ seed = 'ECOEATS', size = 108 }) {
  const cells = 9
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  const grid = []
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isFinder = (r < 3 && c < 3) || (r < 3 && c > cells - 4) || (r > cells - 4 && c < 3)
      if (isFinder) continue
      hash = (hash * 1103515245 + 12345) >>> 0
      if (hash % 100 < 46) grid.push([r, c])
    }
  }
  const cell = size / cells
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="fake-qr" aria-hidden="true">
      <rect width={size} height={size} fill="var(--paper)" />
      {[[0, 0], [0, cells - 3], [cells - 3, 0]].map(([r, c], i) => (
        <g key={i}>
          <rect x={c * cell} y={r * cell} width={cell * 3} height={cell * 3} fill="var(--ink)" />
          <rect x={c * cell + cell} y={r * cell + cell} width={cell} height={cell} fill="var(--paper)" />
        </g>
      ))}
      {grid.map(([r, c], i) => (
        <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill="var(--ink)" />
      ))}
    </svg>
  )
}

/* ============================================================
   RESCUE MODAL — fake but complete pickup flow: lihat detail →
   pilih jam ambil → konfirmasi → receipt + kode QR. Tidak ada
   backend; semua state lokal, hilang begitu modal ditutup.
   ============================================================ */
function timeSlotsFor(item) {
  const [h, m] = item.pickupStart.split(':').map(Number)
  const base = h * 60 + m
  return [0, 15, 30].map((add) => {
    const total = base + add
    const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    return `${hh}.${mm}`
  })
}

function RescueModal({ item, onClose }) {
  const [step, setStep] = useState('detail')
  const [selectedTime, setSelectedTime] = useState(null)
  const slots = timeSlotsFor(item)
  const pickupCode = `ECO-${item.code.replace('#EC-', '')}`
  const printedCode = usePrintedDigits(step === 'receipt' ? pickupCode : '', 70, 200)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="bezel"><div className={`bezel-core receipt modal-receipt ${step === 'receipt' ? 'receipt-stamped' : ''}`}>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">×</button>

          {step === 'detail' && (
            <>
              <span className="merchant mono">{item.merchant}</span>
              <h3 className="modal-title">{item.name}</h3>
              <div className="modal-badges">
                <span className="mbadge">★ {item.rating.toFixed(1)}</span>
                <span className="mbadge">📍 {item.distance}</span>
                {item.halal && <span className="mbadge">✓ Halal</span>}
                <span className="mbadge mbadge-stock">Tersisa {item.stock}</span>
              </div>
              <p className="modal-desc">{item.desc}</p>
              <div className="modal-row">
                <span>Pickup window</span>
                <strong className="mono">{item.pickupStart} – {item.pickupBy}</strong>
              </div>
              <div className="modal-row">
                <span>Harga</span>
                <strong className="mono">{item.now} <span className="was">{item.was}</span></strong>
              </div>
              <button className="hero-tear-cta modal-cta" onClick={() => setStep('time')}>
                <span>Selamatkan Sekarang</span><Arrow />
              </button>
            </>
          )}

          {step === 'time' && (
            <>
              <span className="merchant mono">{item.merchant}</span>
              <h3 className="modal-title">Pilih jam ambil</h3>
              <p className="modal-desc">Datang di jendela waktu ini supaya stok masih terjamin untukmu.</p>
              <div className="time-options">
                {slots.map((t) => (
                  <label key={t} className={`time-option ${selectedTime === t ? 'active' : ''}`}>
                    <input
                      type="radio" name="pickup-time" value={t}
                      checked={selectedTime === t}
                      onChange={() => setSelectedTime(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
              <button
                className="hero-tear-cta modal-cta"
                disabled={!selectedTime}
                onClick={() => setStep('receipt')}
              >
                <span>Konfirmasi</span><Arrow />
              </button>
            </>
          )}

          {step === 'receipt' && (
            <>
              <div className="hero-receipt-head">
                <span className="mono">ECOEATS RECEIPT</span>
                <span className="mono">RESCUED</span>
              </div>
              <div className="modal-row"><span>Merchant</span><strong>{item.merchant}</strong></div>
              <div className="modal-row"><span>Item</span><strong>{item.name}</strong></div>
              <div className="modal-row"><span>Harga</span><strong className="mono">{item.now}</strong></div>
              <div className="modal-row"><span>Pickup</span><strong className="mono">{selectedTime}</strong></div>
              <div className="receipt-print-code mono">{printedCode}<span className="hero-receipt-cursor" aria-hidden="true" /></div>
              <div className="modal-qr-wrap">
                <FakeQR seed={pickupCode} />
                <span className="mono modal-qr-caption">Tunjukkan ke merchant</span>
              </div>
              <Barcode seed={pickupCode} caption={`${pickupCode} · Status: RESCUED`} />
              <button className="btn-ghost modal-cta" onClick={onClose}>Selesai</button>

              <div className="rescued-stamp-wrap" aria-hidden="true">
                <div className="rescued-stamp-ring" />
                <div className="rescued-stamp">
                  <span>RESCUED</span>
                  <span className="rescued-stamp-sub">EcoEats · Solo</span>
                </div>
              </div>
            </>
          )}
        </div></div>
      </div>
    </div>
  )
}

function FoodCard({ it, onOpen }) {
  const countdown = useCountdown(it.pickupBy)
  return (
    <div className="food-card-wrap card-in">
      <button className="food-card-btn" onClick={() => onOpen(it)} aria-label={`Lihat detail ${it.name}`}>
        <div className="bezel tilt"><div className="bezel-core receipt food-card">
          <span className="badge mono">{it.disc}</span>
          <div className="code-row">
            <span className="listing-code mono">{it.code}</span>
          </div>
          <span className="merchant mono">{it.merchant}</span>
          <h3>{it.name}</h3>
          <div className="food-card-badges">
            <span className="mbadge">★ {it.rating.toFixed(1)}</span>
            <span className="mbadge">📍 {it.distance}</span>
            {it.halal && <span className="mbadge">✓ Halal</span>}
            <span className="mbadge mbadge-stock">Tersisa {it.stock}</span>
          </div>
          <p>{it.desc}</p>
          <span className="countdown"><ClockIcon /> Ambil {it.pickupStart}–{it.pickupBy} · {countdown}</span>
          <div className="price">
            <span className="now">{it.now}</span>
            <span className="was">{it.was}</span>
          </div>
          <div className="card-barcode">
            <Barcode seed={it.code} height={16} />
          </div>
        </div></div>
      </button>
    </div>
  )
}

function Temukan() {
  const [active, setActive] = useState('Semua')
  const [selected, setSelected] = useState(null)
  const items = active === 'Semua' ? FOOD_ITEMS : FOOD_ITEMS.filter((it) => it.category === active)
  return (
    <section className="listing" id="temukan">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="kicker">Temukan sekarang</span>
          <h2>Makanan surplus di sekitarmu, hari ini.</h2>
          <p>Klik salah satu listing untuk mencoba alur penyelamatannya — pilih jam ambil, lalu dapatkan receipt dan kode pickup.</p>
        </div>
        <div className="filter-row reveal">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${active === c ? 'active' : ''}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="listing-grid">
          {items.map((it) => <FoodCard it={it} key={it.name} onOpen={setSelected} />)}
        </div>
      </div>
      {selected && <RescueModal item={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}

function DeviceIcon({ type }) {
  if (type === 'desktop') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" />
      </svg>
    )
  }
  if (type === 'tablet') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
      </svg>
    )
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" />
    </svg>
  )
}

/* ============================================================
   MOBILE PREVIEW — "EcoEats di genggamanmu".
   ============================================================ */
function GenggamanmuPreview() {
  return (
    <section className="pocket">
      <div className="wrap">
        <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Satu pengalaman, semua layar</span>
          <h2>EcoEats di genggamanmu.</h2>
          <p style={{ margin: '18px auto 0' }}>Kini menyelamatkan makanan semudah membuka ponsel — antrean listing dan alur pickup yang sama persis, di layar mana pun.</p>
          <div className="device-badges">
            <span className="device-badge"><DeviceIcon type="desktop" /> Desktop</span>
            <span className="device-badge"><DeviceIcon type="tablet" /> Tablet</span>
            <span className="device-badge"><DeviceIcon type="mobile" /> Mobile</span>
          </div>
        </div>

        <div className="pocket-stage">
          <div className="pocket-receipt reveal reveal-left">
            <div className="bezel"><div className="bezel-core receipt pocket-receipt-core">
              <div className="hero-receipt-head">
                <span className="mono">NOTA POTENSI HARIAN</span>
                <span className="mono">SOLO</span>
              </div>
              <div className="hero-receipt-items" style={{ margin: '18px 0 4px' }}>
                <div className="hero-receipt-item"><span>Roti Ibu Sri</span><span className="mono">Rp7.500</span></div>
                <div className="hero-receipt-item"><span>Warung Bu Marni</span><span className="mono">Rp9.000</span></div>
                <div className="hero-receipt-item"><span>Kedai Kopi Solo</span><span className="mono">Rp6.500</span></div>
              </div>
              <div className="pocket-receipt-tear" aria-hidden="true" />
            </div></div>
          </div>

          <div className="pocket-arrow-flow mono" aria-hidden="true">menjadi</div>

          <div className="pocket-phone reveal reveal-right">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-topbar">
                  <span className="mono">9:41</span>
                  <span className="mono">EcoEats</span>
                </div>
                <div className="phone-app-nav">
                  <span className="brand" style={{ fontSize: '0.98rem' }}><span className="mark" />EcoEats</span>
                </div>
                <div className="phone-card">
                  <span className="badge mono" style={{ position: 'static' }}>-50%</span>
                  <span className="merchant mono">Roti Ibu Sri</span>
                  <h3>Roti Tawar Gandum</h3>
                  <div className="food-card-badges">
                    <span className="mbadge">★ 4.9</span>
                    <span className="mbadge">📍 600 m</span>
                    <span className="mbadge mbadge-stock">Tersisa 3</span>
                  </div>
                  <div className="price"><span className="now">Rp7.500</span><span className="was">Rp15.000</span></div>
                  <button className="hero-tear-cta phone-cta"><span>Selamatkan</span><Arrow /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DampakKalkulator() {
  const [porsi, setPorsi] = useState(3)
  const kgPerTahun = Math.round(porsi * 0.4 * 52)
  const rupiahPerTahun = porsi * 7500 * 52
  const rupiahFormatted = rupiahPerTahun.toLocaleString('id-ID')
  const receiptCode = `#EC-U${String(porsi).padStart(2, '0')}${new Date().getDate()}`

  return (
    <section id="dampak">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="kicker">Kalkulator</span>
          <h2>Target bersama, lalu kontribusimu sendiri.</h2>
          <p>Ini target dampak yang ingin dicapai EcoEats di tahap awal peluncuran di Solo — dan berapa besar bagian yang bisa kamu ambil di dalamnya.</p>
        </div>

        <div className="impact-grid reveal">
          <div><div className="bezel tilt"><div className="bezel-core impact-box">
            <div className="stamp-ring" aria-hidden="true"></div>
            <div className="count"><span>Prototype</span></div>
            <div className="cap">Konsep dan alur onboarding merchant siap diuji dalam skala pilot.</div>
          </div></div></div>
          <div><div className="bezel tilt"><div className="bezel-core impact-box">
            <div className="stamp-ring" aria-hidden="true"></div>
            <div className="count"><span>Merchant onboarding available</span></div>
            <div className="cap">Pendaftaran merchant dapat diaktifkan pada tahap uji coba awal.</div>
          </div></div></div>
          <div><div className="bezel tilt"><div className="bezel-core impact-box">
            <div className="stamp-ring" aria-hidden="true"></div>
            <div className="count"><span>Pilot Program Ready</span></div>
            <div className="cap">Alur pengguna dan merchant sudah siap untuk pengujian lapangan.</div>
          </div></div></div>
        </div>

        <div className="dampak-personal reveal">
          <div className="dampak-personal-head">
            <span className="kicker" style={{ color: '#B7C27E' }}>Kontribusimu</span>
            <h3>Coba hitung dampak versimu sendiri.</h3>
            <p>Geser sesuai berapa porsi makanan surplus yang ingin kamu selamatkan setiap minggu — hasil di bawah ini merupakan estimasi untuk tujuan edukasi.</p>
          </div>
          <div className="calc-panel">
            <div className="calc-slider">
              <label>Porsi diselamatkan / minggu</label>
              <input
                type="range" min="1" max="14" value={porsi}
                onChange={(e) => setPorsi(Number(e.target.value))}
                aria-label="Jumlah porsi makanan diselamatkan per minggu"
              />
              <div className="calc-value mono">{porsi} porsi / minggu</div>
              <div className="calc-results">
                <div className="calc-result">
                  <div className="n mono">{kgPerTahun} kg</div>
                  <div className="l">≈ estimasi makanan terselamatkan</div>
                </div>
                <div className="calc-result">
                  <div className="n mono">Rp{rupiahFormatted}</div>
                  <div className="l">≈ estimasi potensi pengurangan limbah</div>
                </div>
              </div>
              <p className="mono" style={{ marginTop: 12, fontSize: '0.82rem' }}>Perhitungan bersifat estimasi untuk tujuan edukasi.</p>
            </div>

            <div className="calc-receipt-wrap">
              <div className="bezel" key={porsi}>
                <div className="bezel-core receipt calc-receipt receipt-print">
                  <div className="ticket-head">
                    <span className="ticket-merchant">Prototype Simulation</span>
                    <span className="ticket-badge">Demo</span>
                  </div>
                  <div className="receipt-code">{receiptCode}</div>
                  <div className="rows">
                    <div className="row"><span>Porsi / minggu</span><strong>{porsi}x</strong></div>
                    <div className="row"><span>≈ estimasi dampak lingkungan</span><strong>{kgPerTahun} rescue</strong></div>
                    <div className="row"><span>≈ estimasi potensi pengurangan limbah</span><strong>Rp{rupiahFormatted}</strong></div>
                  </div>
                  <div className="total-row">
                    <span className="l">Demo Projection</span>
                    <span className="v mono">{kgPerTahun} rescue</span>
                  </div>
                  <div className="barcode-row">
                    <Barcode seed={receiptCode} caption={`${receiptCode} · dicetak otomatis`} />
                  </div>
                  <button className="btn-ghost share-btn">Bagikan Struk Dampak</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Cerita() {
  return (
    <section className="cerita">
      <div className="wrap">
        <div className="cerita-grid">
          <div className="cerita-visual reveal" aria-hidden="true">
            <svg width="86" height="86" viewBox="0 0 24 24" fill="none" stroke="#FBF2DE" strokeWidth="1.1">
              <path d="M4 11h16M4 11a8 8 0 0116 0M4 11v2a8 8 0 0016 0v-2M9 4v3M15 4v3" />
            </svg>
          </div>
          <div className="reveal">
            <p className="quote">
              Makanan sisa akhir hari di sektor kuliner umumnya berakhir dibagikan gratis
              atau langsung dibuang. Platform yang memungkinkan penjualan dengan harga
              wajar sebelum tutup toko membuka peluang pemasukan tambahan bagi usaha
              kecil, sekaligus mengurangi makanan yang terbuang percuma.
            </p>
            <div className="quote-attr"><strong>Ilustrasi kasus</strong> — pola operasional UMKM kuliner skala kecil di Indonesia</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTAFooter() {
  return (
    <>
      <section>
        <div className="wrap">
          <div className="cta-block reveal">
            <h2>Ada warung yang menutup lapak malam ini — dengan atau tanpa kamu tahu.</h2>
            <p>Pilihannya sederhana: jadi salah satu yang menjembatani, atau biarkan rezeki itu berakhir di tempat sampah seperti biasanya. Solo yang lebih sedikit membuang, dimulai dari satu porsi yang kamu selamatkan malam ini.</p>
            <div className="hero-ctas" style={{ justifyContent: 'center' }}>
              <button className="btn-primary solid-ink">
                Daftar Jadi Merchant
                <span className="icon-chip"><Arrow /></span>
              </button>
              <button className="btn-ghost">Jelajahi Makanan Malam Ini</button>
            </div>
          </div>
        </div>
      </section>
      <section style={{ paddingTop: 8, paddingBottom: 24 }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ marginBottom: 16 }}>
            <span className="kicker">Sources</span>
            <h3 style={{ fontSize: '1.15rem' }}>Referensi yang dipakai untuk framing dan copy.</h3>
          </div>
          <ul style={{ display: 'grid', gap: '0.55rem', paddingLeft: '1rem', color: 'var(--ink-2)' }}>
            <li><a href="https://www.unep.org/resources/publication/food-waste-index-report-2024?os=win&utm_source=chatgpt.com" target="_blank" rel="noreferrer">UNEP Food Waste Index Report 2024</a></li>
            <li><a href="https://www.fao.org/family-farming/detail/en/c/1681058/?trk=public_post_comment-text&utm_source=chatgpt.com" target="_blank" rel="noreferrer">FAO Food Loss &amp; Waste</a></li>
            <li><a href="https://sdgs.unep.org/article/2a5-food-waste-index?utm_source=chatgpt.com" target="_blank" rel="noreferrer">UNEP SDG 12.3 Food Waste Index</a></li>
            <li><a href="https://www.unep.org/topics/food-systems/food-loss-and-waste?utm_source=chatgpt.com" target="_blank" rel="noreferrer">UNEP Food Loss and Waste Overview</a></li>
          </ul>
        </div>
      </section>
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="brand" style={{ color: 'var(--paper)' }}><span className="mark" />EcoEats</div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {NAV_ITEMS.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
            </div>
          </div>
          <div className="foot-receipt">
            <Barcode seed="ECOEATS-SOLO-2026" caption="NOTA #EC-FOOTER · Bytesfest 2026" />
          </div>
          <div className="copyright">Bersama EcoEats, setiap makanan memiliki kesempatan kedua.</div>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  useReveal()
  useCounters()
  useTilt()
  return (
    <>
      <Nav />
      <Hero />
      <Masalah />
      <Cerita />
      <CaraKerja />
      <DampakSDG />
      <Temukan />
      <GenggamanmuPreview />
      <DampakKalkulator />
      <CTAFooter />
    </>
  )
}