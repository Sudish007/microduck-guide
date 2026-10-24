/* Microduck Field Guide — theme, section tracking, budget calculator, resource catalogue. No dependencies. */
(function () {
  'use strict';

  /* ---------------- Theme ---------------- */
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    toggle.textContent = t === 'dark' ? 'Light' : 'Dark';
    toggle.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    toggle.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' theme');
  }
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('mdg-theme', next); } catch (e) {}
  });

  /* ---------------- Hero video: respect reduced motion, offer a pause ---------------- */
  var vid = document.querySelector('.hero-video');
  var vidBtn = document.getElementById('vidToggle');
  if (vid && vidBtn) {
    var setBtn = function () {
      var playing = !vid.paused;
      vidBtn.textContent = playing ? 'Pause' : 'Play';
      vidBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    };
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { vid.removeAttribute('autoplay'); vid.pause(); }
    vid.addEventListener('play', setBtn); vid.addEventListener('pause', setBtn);
    vidBtn.addEventListener('click', function () { if (vid.paused) { vid.play(); } else { vid.pause(); } });
    setBtn();
  }

  /* ---------------- Current section ---------------- */
  var sectionIds = ['news', 'robot', 'open', 'learn', 'build', 'budget', 'resources'];
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a, .rail a'));
  function setCurrent(id) {
    navLinks.forEach(function (a) {
      a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false');
    });
  }
  if ('IntersectionObserver' in window) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, bestRatio = 0;
      sectionIds.forEach(function (id) { if ((visible[id] || 0) > bestRatio) { bestRatio = visible[id]; best = id; } });
      if (best) setCurrent(best);
    }, { rootMargin: '-80px 0px -40% 0px', threshold: [0, 0.1, 0.25, 0.5] });
    sectionIds.forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------------- Budget calculator ----------------
     Each line: { name, sub, qty, where, label, inr:[lo,hi] | usd:[lo,hi] (imported), kind }
     kind: 'print' (printer toggle), 'controller', 'tools', 'cloud' (gpu toggle) */
  var ROUTES = {
    odm: {
      title: 'Open Duck Mini v2 · parts list',
      note: 'Follows the published Open Duck Mini v2 BOM (author\'s total €398, lowest €331, before the optional expression package): fourteen Feetech STS3215 7.4 V bus servos on one TTL chain through a Waveshare bus-servo adapter, a Raspberry Pi Zero 2 W, a BNO055 IMU, and a 2S pack built from two 18650 cells with a BMS. Servo prices are what Indian shops list for the 7.4 V STS3215/ST3215 today; the BOM warns to buy the 7.4 V ("19 kg·cm") variant.',
      lines: [
        { name: 'Feetech STS3215 7.4 V bus servo', sub: '12-bit magnetic encoder, 1 Mbps half-duplex TTL', qty: 14, inr: [1900, 2300], where: 'Evelta (ST3215 7.4 V ₹1,885 ex GST; STS3215-C046 ₹2,224 inc), Robu.in, Robocraze; Seeed / AliExpress abroad', label: 'fact' },
        { name: 'Raspberry Pi Zero 2 W', sub: 'runs the 50 Hz policy loop; 2.4 GHz Wi-Fi only', qty: 1, inr: [1749, 2799], where: 'Evelta ₹1,749 · Robocraze ₹2,799 · QuartzComponents', label: 'fact' },
        { name: 'Waveshare Bus Servo Adapter (A)', sub: 'USB to the Feetech TTL bus; also used to configure each servo before assembly', qty: 1, inr: [600, 1200], where: 'Robu.in, Robocraze', label: 'est' },
        { name: 'BNO055 9-DoF IMU breakout', sub: 'I²C on the Pi header (pins 1, 3, 5, 9); orientation is set in duck_config.json', qty: 1, inr: [700, 1500], where: 'Robu.in, Robocraze, Evelta', label: 'est' },
        { name: 'Battery: 2× 18650 cells + 2S holder + 2S BMS + USB-C charger board', sub: 'per the BOM: high-discharge cells (Molicel P30B-class, 3000 mAh / 30 A); charge both cells to the same voltage before fitting', qty: 1, inr: [1500, 2800], where: 'Robu.in (cells, BMS, holder, charger board), local hobby shops', label: 'est' },
        { name: '5 V UBEC regulator (4 A or more) + XT30 pair + 2.1 mm barrel jacks + power switch', sub: 'the BOM\'s power chain; the Pi must never hang off the battery directly', qty: 1, inr: [700, 1500], where: 'Robu.in, Robocraze', label: 'est' },
        { name: 'microSD 32 GB (A1)', sub: 'the pre-built duck.iso targets 32 GB cards', qty: 1, inr: [400, 700], where: 'anywhere', label: 'est' },
        { name: 'Printed parts: 36 part types, PLA 15% infill + TPU feet 40%', sub: 'about 500 g of PLA per the BOM, plus a little TPU; STLs in the repo\'s print/ folder', qty: 1, kind: 'print', inrService: [4000, 9000], inrFilament: [600, 1200], where: 'local print service (Robu 3D printing, city makerspaces) or your own printer', label: 'est' },
        { name: 'M3 heat-set inserts, M3 screws (M3×6, M3×10), 3 bearings, Loctite 243, cable sheath, wire, heat-shrink', sub: 'exact screw count is still a TODO in the assembly guide; buy an M3 assortment', qty: 1, inr: [900, 1800], where: 'Robu.in, Amazon.in, local hardware', label: 'est' },
        { name: 'Optional: 4× SS-10 foot switches, 2× 9 g servos (antennas), 15 cm + 50 cm micro-USB to USB-C cables', sub: 'foot switches drive the image\'s foot-based autostart; antennas are an expression feature', qty: 1, inr: [300, 700], where: 'Robu.in, Amazon.in', label: 'est' },
        { name: 'Bluetooth game controller', sub: 'Xbox-class pad; an 8BitDo works', qty: 1, kind: 'controller', inr: [2500, 4500], where: 'Amazon.in', label: 'est' },
        { name: 'Tools: soldering kit, multimeter, crimper + JST connectors, driver set', sub: 'one-time', qty: 1, kind: 'tools', inr: [2500, 4500], where: 'Robu.in, Amazon.in', label: 'est' },
        { name: 'Cloud GPU for training', sub: 'HF Jobs L4 ≈ $0.80/h; Colab free tier also works', qty: 1, kind: 'cloud', inr: [100, 500], where: 'Hugging Face Jobs, Google Colab', label: 'est' }
      ]
    },
    replica: {
      title: 'XL330 Microduck replica · parts list',
      note: 'Follows the AI-FanGe / OpenELAB build that walks on video: 14 XL330-M288-T under policy control plus an optional 15th for the beak, a Raspberry Pi Zero 2 W talking to the Dynamixel bus through a ROBOTIS OpenRB-150, a BNO08x IMU and a ready-made 6 V pack. No Indian stockist of the XL330 was verified, so it is costed as an import at the rate and markup you set.',
      lines: [
        { name: 'Dynamixel XL330-M288-T', sub: '18 g, 288:1, Protocol 2.0; 14 minimum, 15 with the beak', qty: 15, usd: [23.9, 39], where: 'ROBOTIS global store ($23.90, ships internationally), ROBOTIS US ($27.49), Generation Robots (€33.50 ex VAT), OpenELAB. No Indian stock found 24 Oct 2026', label: 'unc' },
        { name: 'Raspberry Pi Zero 2 W', sub: 'or a Radxa Zero 3W (RK3566, import ≈ $35 to 45) to match the original SoC', qty: 1, inr: [1749, 2799], where: 'Evelta ₹1,749 · Robocraze ₹2,799', label: 'fact' },
        { name: 'ROBOTIS OpenRB-150', sub: 'USB to Dynamixel bus bridge; U2D2 ($36.92) is the alternative', qty: 1, usd: [25, 30], where: 'ROBOTIS store (import)', label: 'unc' },
        { name: 'BNO085 / BNO086 9-DoF IMU breakout', sub: 'I²C to the Pi; mount square to the body frame', qty: 1, inr: [1775, 2399], where: 'Evelta (7Semi BNO085 ₹1,775 ex GST), Robocraze ₹2,095 to 2,399', label: 'fact' },
        { name: 'Ready-made 6 V rechargeable pack + charger (the tutorial\'s choice)', sub: 'keeps the XL330s inside their 6.0 V rating and matches the tutorial\'s walk.onnx; the original instead runs a 2S NP-F550 at 6.6 to 8.2 V for more torque, at the cost of heat', qty: 1, inr: [1200, 2500], where: 'Robu.in, Amazon.in (6 V NiMH/Li-ion packs with enough peak current for 14 servos)', label: 'est' },
        { name: '5 V 3 A buck converter', sub: 'Pi power; servo bus fed from the battery branch', qty: 1, inr: [100, 300], where: 'Robu.in, Robocraze', label: 'est' },
        { name: 'microSD 32 GB (A1)', sub: 'for the build tutorial image', qty: 1, inr: [400, 700], where: 'anywhere', label: 'est' },
        { name: 'Printed parts: PLA (FDM-redesigned set)', sub: 'about 0.5 kg; use BoBoRedesign or the tutorial\'s Bambu profiles, not raw sim meshes', qty: 1, kind: 'print', inrService: [3500, 8000], inrFilament: [700, 1200], where: 'local print service or your own printer', label: 'est' },
        { name: 'M2/M2.5 self-tapping screws, POM and steel shims, Dynamixel 3-pin cables, JST-EH terminals, switch, wire, heat-shrink', sub: 'short 3-pin cables are the fiddly import item; the shims are the joints\' low-cost bearings', qty: 1, inr: [1200, 2500], where: 'ROBOTIS (cables), Robu.in, Amazon.in', label: 'est' },
        { name: 'Bluetooth game controller', sub: 'Xbox-class pad', qty: 1, kind: 'controller', inr: [2500, 4500], where: 'Amazon.in', label: 'est' },
        { name: 'Tools: soldering kit, multimeter, crimper, driver set', sub: 'one-time', qty: 1, kind: 'tools', inr: [2500, 4500], where: 'Robu.in, Amazon.in', label: 'est' },
        { name: 'Cloud GPU for retraining', sub: 'your mass and IMU placement differ from Pollen\'s; expect to retrain', qty: 1, kind: 'cloud', inr: [100, 500], where: 'Hugging Face Jobs, Google Colab', label: 'est' }
      ]
    },
    buy: {
      title: 'Buy the Microduck · landed cost',
      note: 'The $399 introductory price is before tax and shipping, and India is not among the launch markets, so this assumes a forwarding address or a later India launch. The import markup stands in for courier, customs duty and IGST; the real figure depends on the courier and declared value.',
      lines: [
        { name: 'Microduck (robot, battery, USB-C cable, controller)', sub: 'introductory pre-order price', qty: 1, usd: [399, 399], where: 'store.pollen-robotics.com', label: 'fact' },
        { name: 'Charger pack: dual charger + 2 batteries', sub: 'recommended; one battery is about an hour', qty: 1, usd: [39, 39], where: 'store.pollen-robotics.com', label: 'fact' },
        { name: 'Dev pack: 3 spare motors, cables, batteries, tools (optional)', sub: 'the only official spares channel today', qty: 0, usd: [119, 119], where: 'store.pollen-robotics.com', label: 'fact' },
        { name: 'Cloud GPU for training your own moves', sub: 'optional', qty: 1, kind: 'cloud', inr: [100, 500], where: 'Hugging Face Jobs, Google Colab', label: 'est' }
      ]
    },
    sim: {
      title: 'Simulation only · what you spend',
      note: 'Everything in Levels 0 to 3 of the learning path. The only possible spend is cloud GPU time, and the free tiers cover a first walking policy.',
      lines: [
        { name: 'Microduck Sandbox, trymicroduck, kinematic viewer (browser)', sub: 'the real policies, no install', qty: 1, inr: [0, 0], where: 'Hugging Face Spaces', label: 'fact' },
        { name: 'CPU MuJoCo on your laptop (infer_policy.py, microduck-docker)', sub: 'drive exported policies with the keyboard', qty: 1, inr: [0, 0], where: 'GitHub', label: 'fact' },
        { name: 'Cloud GPU for training', sub: 'HF Jobs ≈ $0.80/h on an L4; Colab free tier; CPU-only mjbatch at ₹0', qty: 1, kind: 'cloud', inr: [0, 500], where: 'Hugging Face Jobs, Google Colab', label: 'est' }
      ]
    }
  };

  var form = document.getElementById('calcForm');
  var tbody = document.querySelector('#bomTable tbody');
  var tLo = document.getElementById('tLo'), tHi = document.getElementById('tHi');
  var totalOut = document.getElementById('totalOut'), totalNote = document.getElementById('totalNote');
  var bomTitle = document.getElementById('bomTitle'), bomNote = document.getElementById('bomNote');
  var LABEL_TEXT = { fact: 'fact', est: 'estimate', unc: 'uncertain' };

  function fmt(n) {
    n = Math.round(n);
    if (n >= 100000) return '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
    return '₹' + n.toLocaleString('en-IN');
  }
  function fmtFull(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

  function compute() {
    var route = form.route.value;
    var have = {};
    Array.prototype.forEach.call(form.querySelectorAll('input[name="have"]:checked'), function (c) { have[c.value] = true; });
    var rate = parseFloat(document.getElementById('rate').value) || 95;
    var imp = 1 + (parseFloat(document.getElementById('imp').value) || 0) / 100;
    var spares = document.getElementById('spares').checked;
    var R = ROUTES[route];

    bomTitle.textContent = R.title;
    bomNote.textContent = R.note;
    tbody.innerHTML = '';
    var lo = 0, hi = 0, importedLo = 0;

    R.lines.forEach(function (L) {
      var qty = L.qty, off = false, lineLo, lineHi, whereTxt = L.where;
      var isImport = !!L.usd;
      if (L.kind === 'print') {
        var r = have.printer ? L.inrFilament : L.inrService;
        lineLo = r[0]; lineHi = r[1];
        whereTxt = have.printer ? 'filament for your own printer' : whereTxt;
      } else if (isImport) {
        lineLo = L.usd[0] * rate * imp; lineHi = L.usd[1] * rate * imp;
      } else {
        lineLo = L.inr[0]; lineHi = L.inr[1];
      }
      if ((L.kind === 'controller' && have.controller) || (L.kind === 'tools' && have.tools) || (L.kind === 'cloud' && have.gpu)) { off = true; }
      if (qty === 0) off = true;
      var q = qty === 0 ? 1 : qty;
      var rowLo = off ? 0 : lineLo * q, rowHi = off ? 0 : lineHi * q;
      lo += rowLo; hi += rowHi; if (isImport && !off) importedLo += rowLo;

      var tr = document.createElement('tr');
      if (off) tr.className = 'bom-row-off';
      tr.innerHTML =
        '<td>' + esc(L.name) + (L.sub ? '<span class="sub">' + esc(L.sub) + '</span>' : '') + '</td>' +
        '<td class="num">' + (qty === 0 ? '0 (opt.)' : qty) + '</td>' +
        '<td>' + esc(whereTxt) + (isImport ? '<span class="sub">imported: $' + L.usd[0] + (L.usd[1] !== L.usd[0] ? ' to $' + L.usd[1] : '') + ' × ₹' + rate + ' × ' + imp.toFixed(2) + '</span>' : '') + '</td>' +
        '<td class="num">' + (off ? (qty === 0 ? '—' : '₹0') : fmtFull(rowLo)) + '</td>' +
        '<td class="num">' + (off ? (qty === 0 ? '—' : '₹0') : fmtFull(rowHi)) + '</td>' +
        '<td><span class="chip ' + (L.label === 'unc' ? 'unc' : L.label) + '">' + LABEL_TEXT[L.label] + '</span>' + (off && qty !== 0 ? ' <span class="chip tag">owned</span>' : '') + '</td>';
      tbody.appendChild(tr);
    });

    if (spares && route !== 'sim' && route !== 'buy') { lo *= 1.10; hi *= 1.10; }
    tLo.textContent = fmtFull(lo); tHi.textContent = fmtFull(hi);
    totalOut.firstChild.nodeValue = lo === hi ? fmt(lo) : fmt(lo) + ' to ' + fmt(hi);
    var notes = [];
    if (route === 'buy') notes.push('≈ $' + Math.round(lo / rate / imp) + ' before import handling');
    if (importedLo > 0) notes.push('imports included at ₹' + rate + '/$ + ' + Math.round((imp - 1) * 100) + '%');
    if (spares && route !== 'sim' && route !== 'buy') notes.push('includes 10% spares');
    if (route === 'sim') notes.push('free tiers cover a first walking policy');
    totalNote.textContent = notes.join(' · ');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  form.addEventListener('input', compute);
  form.addEventListener('change', compute);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  compute();

  /* ---------------- Resource catalogue ---------------- */
  var GROUPS = [
    ['official', 'Official'], ['docs', 'Docs'], ['sim', 'Simulation & training'], ['hardware', 'Hardware & replicas'],
    ['shops', 'Where to buy (India and import)'], ['press', 'Articles'], ['video', 'Videos'], ['community', 'Community & lineage']
  ];
  var RES = [
    // official
    { g: 'official', t: 'Product page', u: 'https://pollen-robotics.com/microduck/', d: 'Specs, colourways, the launch story, the packs.' },
    { g: 'official', t: 'Store · pre-order', u: 'https://store.pollen-robotics.com/products/microduck', d: '$399 introductory price before tax and shipping. Launch markets: North America, Europe, UK.' },
    { g: 'official', t: 'Press kit', u: 'https://pollen-robotics.com/microduck/press-kit/', d: 'Full spec sheet, the open-source boundary statement, photos, fact sheet.' },
    { g: 'official', t: 'Meet Microduck (launch post)', u: 'https://pollen-robotics.com/microduck/blog/introducing-microduck/', d: 'Pollen\'s own account of why they built it.' },
    { g: 'official', t: 'pollen-robotics/microduck', u: 'https://github.com/pollen-robotics/microduck', d: 'The robot\'s software: robotd 50 Hz loop, mediad, padd, updater, robotctl policy channel. Rust, Apache-2.0.' },
    { g: 'official', t: 'pollen-robotics/microduck_rl', u: 'https://github.com/pollen-robotics/microduck_rl', d: 'Training environments on mjlab with PPO, BAM actuators, backlash and domain randomisation. CUDA GPU or --hf-jobs.', tags: ['sim'] },
    { g: 'official', t: 'microduck-policies (Hub)', u: 'https://huggingface.co/pollen-robotics/microduck-policies', d: 'The ten official ONNX policies with one manifest; velstand is the default walk.' },
    { g: 'official', t: 'Microduck Sandbox', u: 'https://huggingface.co/spaces/pollen-robotics/microduck-simulator', d: 'Official browser simulator: MuJoCo WebAssembly + onnxruntime-web, real policies at 50 Hz.', tags: ['sim'] },
    { g: 'official', t: 'Policy Playground', u: 'https://huggingface.co/spaces/pollen-robotics/microduck-policy-playground', d: 'Browse every microduck- policy on the Hub and install one onto a duck in one click.' },
    { g: 'official', t: 'Microduck Arena', u: 'https://huggingface.co/spaces/pollen-robotics/microduck-arena', d: 'Leaderboard: 2 m sprint, 2 m roller sprint, 1.5 m hill climb, Got a Talent. Runs locally too.', tags: ['sim'] },
    { g: 'official', t: 'Microduck Console', u: 'https://huggingface.co/spaces/pollen-robotics/microduck-console', d: 'Drive a duck that is not on your network, over WebRTC with Hugging Face sign-in.' },
    { g: 'official', t: 'Vision demo', u: 'https://huggingface.co/spaces/pollen-robotics/microduck-vision-demo', d: 'The duck\'s camera feed processed on Hugging Face hardware instead of the robot.' },
    { g: 'official', t: 'microduck-emotions dataset', u: 'https://huggingface.co/datasets/pollen-robotics/microduck-emotions', d: '14 emotional body-language animations as keyframes and sounds, Apache-2.0.' },
    { g: 'official', t: 'microduck-duck-detector + duck_detector pipeline', u: 'https://github.com/pollen-robotics/duck_detector', d: 'One-class detector that finds other ducks, shipped as PyTorch, ONNX and INT8 RKNN for the NPU.' },
    { g: 'official', t: 'Vet book', u: 'https://huggingface.co/spaces/pollen-robotics/microduck-vetbook', d: 'Hours awake, metres walked, falls, servo swaps, as a shareable card.' },
    { g: 'official', t: 'Pollen Robotics on Hugging Face', u: 'https://huggingface.co/pollen-robotics', d: 'Organisation page hosting the Spaces and models.' },
    // docs
    { g: 'docs', t: 'Docs index', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/README.md', d: 'Map of every document in the robot repo.' },
    { g: 'docs', t: 'Cheat sheet', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/robot/cheatsheet.md', d: 'Every robotctl command: drive, configure, voice, wifi, updates, logs.' },
    { g: 'docs', t: 'Architecture', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/design/architecture.md', d: 'How the daemons, control loop, policies and updater fit together.' },
    { g: 'docs', t: 'Design docs', u: 'https://github.com/pollen-robotics/microduck/tree/main/docs/design', d: 'robotd, updater, remote WebRTC, boot recovery, restart order, the console.' },
    { g: 'docs', t: 'Policy channel design', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/design/policy-channel-design.md', d: 'How community policies reach robots from the Hub: slots, the origin rule, the manifest.' },
    { g: 'docs', t: 'Policy manifest (schema 2)', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/policy-manifest.md', d: 'The manifest.json contract; why only a constant-command episodic policy can become a one-shot skill.' },
    { g: 'docs', t: 'Roadmap M1 to M9', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/project/roadmap.md', d: 'Including the Hub model channel (M8) and the autonomous brain (M9).' },
    { g: 'docs', t: 'duckctl (Bluetooth from a laptop)', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/robot/duckctl.md', d: 'Control the robot with no network and no ssh.' },
    { g: 'docs', t: 'Pair a gamepad', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/robot/pair-a-gamepad.md', d: 'Bonding a controller, and what to do when it will not bond.' },
    { g: 'docs', t: 'Dev board setup', u: 'https://github.com/pollen-robotics/microduck/blob/main/docs/robot/install-dev.md', d: 'From a blank board to a robot that takes branch builds.' },
    { g: 'docs', t: 'Contributing guide', u: 'https://github.com/pollen-robotics/microduck/blob/main/CONTRIBUTING.md', d: 'Upstream standards: building, testing, layout, releasing.' },
    { g: 'docs', t: 'NVIDIA + HF: Isaac Lab sim-to-real', u: 'https://huggingface.co/blog/nvidia/microduck-isaac-lab-sim-to-real', d: 'Train in Isaac Lab + Newton, export ONNX, deploy. The 21 Oct 2026 tutorial.', tags: ['sim'] },
    { g: 'docs', t: 'Actuator selection analysis (microduck-replica)', u: 'https://github.com/fanhao375/microduck-replica/blob/master/docs/actuator-selection.en.md', d: 'Why XL330, the over-voltage finding, what an STS3215 swap really costs, Unitree S288 as the only near drop-in.' },
    { g: 'docs', t: 'Dynamixel XL330-M288-T e-manual', u: 'https://emanual.robotis.com/docs/en/dxl/x/xl330-m288/', d: 'Control table and electrical limits of the servo the training model was identified on.' },
    { g: 'docs', t: 'Dynamixel Wizard 2.0', u: 'https://emanual.robotis.com/docs/en/software/dynamixel/dynamixel_wizard2/', d: 'Set IDs, baud, return delay and PWM slope one servo at a time.' },
    // sim & training
    { g: 'sim', t: 'trymicroduck.com', u: 'https://trymicroduck.com/', d: 'Official model and policies in the browser, untouched; the network computes the walk 50 times a second.', tags: ['sim'] },
    { g: 'sim', t: 'Isaac Lab Microduck port', u: 'https://github.com/5usu/IsaacLab/blob/microduck-port/source/isaaclab_microduck/docs/README.md', d: 'Isaac Lab extension with BAM/backlash actuators and RSL-RL walking, kicking and parkour tasks.', tags: ['sim'] },
    { g: 'sim', t: 'isaaclab-microduck (Newton)', u: 'https://github.com/kabilankb/isaaclab-microduck', d: 'Isaac Lab 3.0 port with locomotion, running, ball-kick and two-robot rally, A/B\'d against mjlab.', tags: ['sim'] },
    { g: 'sim', t: 'microduck-ros2-isaac', u: 'https://github.com/osrbot/microduck-ros2-isaac', d: 'Drive the public model from ROS 2 Jazzy and Isaac Sim, with the walking policy in USD.', tags: ['sim'] },
    { g: 'sim', t: 'microduck_description (ROS 2)', u: 'https://github.com/adityakamath/microduck_description', d: 'URDF and xacro generated from the public model, 38 visual meshes, robot_state_publisher launch.' },
    { g: 'sim', t: 'microduck-sim-playground', u: 'https://github.com/x10zyn/microduck-sim-playground', d: 'Educational workspace: bootstrap script, CPU MuJoCo viewer with keyboard poses.', tags: ['sim'] },
    { g: 'sim', t: 'microduck-lab (Apple Silicon)', u: 'https://github.com/jonathanhawkins/microduck-lab', d: 'Train on a Mac with no CUDA, same MJCF and 61/14 contract, live browser viewer.', tags: ['sim'] },
    { g: 'sim', t: 'microduck-lab (Colab)', u: 'https://github.com/heranhe/microduck-lab-cloud', d: 'Google Colab GPU training path for people without a local NVIDIA card. Bilingual.', tags: ['sim'] },
    { g: 'sim', t: 'microduck-rl-torch', u: 'https://github.com/bsprenger/microduck-rl-torch', d: 'PyTorch-native rewrite for machines without CUDA, same workflow up to an NVIDIA box or the cloud. CI and coverage.', tags: ['sim'] },
    { g: 'sim', t: 'microduck-mjbatch (CPU only)', u: 'https://github.com/tailong-wu/microduck-mjbatch', d: 'Thousands of MuJoCo instances in a C++ thread pool: a walking policy in 2 h 36 min on 8 vCPU.', tags: ['sim'] },
    { g: 'sim', t: 'maxy_duck (Windows)', u: 'https://github.com/CdyDoodle/maxy_duck', d: 'Native Windows simulation with the BAM servo model, training in WSL, web monitor with live curves.', tags: ['sim'] },
    { g: 'sim', t: 'mjlab-sycl (Intel GPUs)', u: 'https://github.com/guang384/mjlab-sycl', d: 'Gets mjlab\'s CUDA-only path training on an Intel integrated GPU or Arc card.', tags: ['sim'] },
    { g: 'sim', t: 'microduck-docker', u: 'https://github.com/srayuth089/microduck-docker', d: 'Simulator, physics and pretrained policies in one container, on Docker Hub.', tags: ['sim'] },
    { g: 'sim', t: 'Microduck Academy (classroom)', u: 'https://github.com/kingsleyli920/microduck-academy', d: 'Staged RL classroom for engineers new to the field, ending in the official simulator.', tags: ['sim'] },
    { g: 'sim', t: 'microduck_rl_tutorial', u: 'https://github.com/rocPAI-Forge/microduck_rl_tutorial', d: 'Beginner Jupyter lab: RL fundamentals through a four-minute train-from-scratch on an MI300X. MIT.', tags: ['sim'] },
    { g: 'sim', t: 'Microduck School (HF Jobs)', u: 'https://huggingface.co/spaces/ysharma/gr-workflow-microduck-school', d: 'Set a lesson in plain English and watch the duck improve while the score climbs.', tags: ['sim'] },
    { g: 'sim', t: 'Microduck Academy (HF Jobs, agentic)', u: 'https://huggingface.co/spaces/tfrere/microduck-academy', d: 'An agent writes the reward and a judge, fine-tunes on your account; hard cap of $5 per session.', tags: ['sim'] },
    { g: 'sim', t: 'MicroDuck Playground', u: 'https://github.com/Vottivott/microduck-playground', d: 'Reproducible experiments, policy demos and printable add-ons, rebased on a pinned upstream.', tags: ['sim'] },
    { g: 'sim', t: 'Locomotion diagnosis (issue #46)', u: 'https://github.com/Qi-hub-dot/microduck-locomotion-diagnosis', d: 'Reproduces the walk-converges-to-standing problem and finds three reward causes. Also: the stack on Windows.', tags: ['sim'] },
    { g: 'sim', t: 'my-microduck-journal', u: 'https://github.com/xinhuagu/my-microduck-journal', d: 'Retraining every skill from scratch on one consumer GPU under WSL2, every dead end written down.', tags: ['sim'] },
    { g: 'sim', t: 'duckbench', u: 'https://github.com/craigm26/duckbench', d: 'Physics bench with golden vectors and scored challenges; also exposed as MCP tools.', tags: ['sim'] },
    { g: 'sim', t: 'microduck-plugin (Cursor / Copilot / Kiro skill)', u: 'https://github.com/acnlabs/microduck-plugin', d: 'The train, export, publish and install loop as a single agent skill. MIT.' },
    { g: 'sim', t: 'Kinematic viewer', u: 'https://github.com/taherfattahi/microduck-rigid-body-kinematic-viewer', d: 'Drag any joint through its real range; one index.html, no build step.' },
    { g: 'sim', t: 'Microduck Anatomy', u: 'https://huggingface.co/spaces/mishig/microduck-anatomy', d: 'Interactive anatomy viewer with exploded assembly views.' },
    { g: 'sim', t: 'Microduck Web (static, offline)', u: 'https://tonyruan.github.io/microduck-web/', d: 'MJCF, physics and eight ONNX policies entirely client-side as a plain static site.', tags: ['sim'] },
    { g: 'sim', t: 'Microduck Android', u: 'https://github.com/TonyRuan/microduck-android', d: 'Real policies and MuJoCo offline on a phone behind a touch joystick, APK published.', tags: ['sim'] },
    { g: 'sim', t: 'esp-duck', u: 'https://github.com/xingxingRealzyx/esp-duck', d: 'All nine shipped policies compiled onto an ESP32-S3 at 50 Hz with INT8 weights.' },
    { g: 'sim', t: 'DuckKit (Swift)', u: 'https://github.com/craigm26/duckkit', d: 'The duck as a Swift package running the real ONNX policies with the real 61-float observation.' },
    { g: 'sim', t: 'Microduck Color Studio', u: 'https://github.com/LathamZ/microduck-color-studio', d: 'Colour the 70-part assembly and export a multi-plate 3MF and per-part STLs for printing.' },
    // hardware & replicas
    { g: 'hardware', t: 'Open Duck Mini v2 (hub)', u: 'https://github.com/apirrone/Open_Duck_Mini', d: 'The open-hardware predecessor: BOM, Onshape CAD, print and assembly guides, two walking policies. Apache-2.0.' },
    { g: 'hardware', t: 'Open Duck Mini v2 · Onshape CAD', u: 'https://cad.onshape.com/documents/64074dfcfa379b37d8a47762/w/3650ab4221e215a4f65eb7fe/e/0505c262d882183a25049d05', d: 'Editable mechanical design.' },
    { g: 'hardware', t: 'Open Duck Mini v2 · BOM (Google Sheet)', u: 'https://docs.google.com/spreadsheets/d/1gq4iWWHEJVgAA_eemkTEsshXqrYlFxXAPwO515KpCJc/edit?usp=sharing', d: 'The official parts list; target under $400.' },
    { g: 'hardware', t: 'Open Duck Mini v2 · assembly guide', u: 'https://github.com/apirrone/Open_Duck_Mini/blob/v2/docs/assembly_guide.md', d: 'Trunk to body with a photo per step, Pi header pin map, battery pack. Screw count and expression features still TODO.' },
    { g: 'hardware', t: 'Open Duck Mini v2 · print guide + STLs', u: 'https://github.com/apirrone/Open_Duck_Mini/blob/v2/docs/print_guide.md', d: '36 part types in print/: PLA 15% infill, foot_bottom_tpu in TPU at 40%.' },
    { g: 'hardware', t: 'Open Duck Mini v2 · configure motors', u: 'https://github.com/apirrone/Open_Duck_Mini/blob/v2/docs/configure_motors.md', d: 'configure_motor.py --id N per servo before assembly; the ID map (10-14, 20-24, 30-33).' },
    { g: 'hardware', t: 'Open Duck Mini v2 · wiring diagram', u: 'https://github.com/apirrone/Open_Duck_Mini/blob/v2/docs/open_duck_mini_v2_wiring_diagram.png', d: 'Power chain (2S cells, BMS, UBEC, switch) and the servo bus; a second schematic sits beside it as wiring.png.' },
    { g: 'hardware', t: 'Open Duck Mini v2 · sim2real notes', u: 'https://github.com/apirrone/Open_Duck_Mini/blob/v2/docs/sim2real.md', d: 'Onshape-to-robot export, BAM parameters for the STS3215, Disney-style imitation reward. Headed “not finalized yet”.' },
    { g: 'hardware', t: 'Open Duck Mini Runtime (Pi image)', u: 'https://github.com/apirrone/Open_Duck_Mini_Runtime/blob/v2/docs/INSTALL.md', d: 'duck.iso for 32 GB cards, user bdxv2, “Openduck” fallback hotspot, foot-switch autostart. Motor and IMU calibration still required.' },
    { g: 'hardware', t: 'Open Duck Playground (training)', u: 'https://github.com/apirrone/Open_Duck_Playground', d: 'MuJoCo Playground environments for Open Duck Mini.' , tags: ['sim'] },
    { g: 'hardware', t: 'Tnkr build guide (Open Duck Mini v2)', u: 'https://tnkr.ai/explore/docs/open-duck-mini/open-duck-mini-v2', d: 'The step-by-step guide the README now recommends.' },
    { g: 'hardware', t: 'Jero (Nunnari Labs, India)', u: 'https://github.com/dev-ansh-r/jero', d: 'Open Duck Mini v2 sourced in India: 14× STS3215, Pi Zero 2 W, Jetson brain over Wi-Fi, gated build plan.' },
    { g: 'hardware', t: 'open-duck-mini deployment workspace', u: 'https://github.com/LIJianxuanLeo/open-duck-mini', d: 'Calibration tooling and Pi provisioning for a physical v2: FTDI bus at 1 Mbps, BNO055 on I²C.' },
    { g: 'hardware', t: 'AI-FanGe Microduck build tutorial', u: 'https://github.com/AI-FanGe/Microduck-build-tutorial', d: 'Working replica on Pi Zero 2 W + OpenRB-150 + 14× XL330 + 6 V pack: BOM, servo IDs, wiring, printable CAD, flashable image, mjlab env.' },
    { g: 'video', t: 'AI-FanGe · Microduck replica build video', u: 'https://www.youtube.com/watch?v=Vep8AjoCnEM', d: 'The hands-on assembly the OpenELAB write-up is based on; walking hardware shown.' },
    { g: 'hardware', t: 'OpenELAB build guide (English write-up)', u: 'https://openelab.io/da/blogs/robotics/microduck-build-guide-openelab', d: 'Parts table, servo ID map, three bus branches, power split, IMU orientation, first steps.' },
    { g: 'hardware', t: 'OpenELAB: Microduck vs Open Duck Mini', u: 'https://openelab.io/nl/blogs/learn/microduck-vs-open-duck-mini', d: 'Buy or build, decided in five questions.' },
    { g: 'hardware', t: 'Microduck DIY build docs', u: 'https://github.com/wslengzhicheng/microduck-diy', d: 'BOM, printing, wiring, phased assembly, servo and IMU commissioning. Apache-2.0, Chinese.' },
    { g: 'hardware', t: 'microduck-replica (teardown study)', u: 'https://github.com/fanhao375/microduck-replica', d: 'Assembly and exploded drawings, fastener list, electronics teardown from the public MJCF and runtime.' },
    { g: 'hardware', t: 'microduck-replica-cad (SolidWorks)', u: 'https://github.com/fanhao375/microduck-replica-cad', d: '56 editable parts and assemblies plus a 21-page assembly manual.' },
    { g: 'hardware', t: 'microduck-hardware-replica (FreeCAD)', u: 'https://github.com/lingzolabs/microduck-hardware-replica', d: 'FreeCAD assemblies, printable meshes, planning-stage BOM. Unverified against hardware.' },
    { g: 'hardware', t: 'OpenMicroDuck (reverse engineering)', u: 'https://github.com/SaberOnGo/open-microduck', d: 'What the robot contains and how its stack works, in English and Chinese.' },
    { g: 'hardware', t: 'OpenMicroDuck (FreeCAD + sim)', u: 'https://github.com/MengyangGao/OpenMicroDuck', d: 'FreeCAD model and drawings with a keyboard-driven MuJoCo sim including ramps and low-grip scenes.' },
    { g: 'hardware', t: 'ChinaMicroDuck', u: 'https://github.com/Shiyao-Huang/ChinaMicroDuck', d: 'Four costed manufacturing routes, a licence audit of the official assets, translated docs.' },
    { g: 'hardware', t: 'MicroDuck BoBoRedesign', u: 'https://github.com/AiBoBoMaker/MicroDuck-BoBoRedesign', d: 'Every part redesigned for FDM and SLA printing, with PCB files. Non-commercial, like the originals.' },
    { g: 'hardware', t: 'MicroDuck 3D assembly guide', u: 'https://ley-wl.github.io/microduck-guide/', d: 'Fifteen modules step by step with servo IDs, a parts inventory and a print list.' },
    { g: 'hardware', t: 'Fanduck (finished replica)', u: 'https://github.com/7757/fanduck', d: 'Photos and video of a working duck from sourcing through assembly, with the maker pack mirrored.' },
    { g: 'hardware', t: 'Microduck Replica Lab', u: 'https://github.com/tachytelicdetonation/microduck-replica-lab', d: 'Assembly explorer, reference CAD, US and China sourcing guides. Not a tested kit.' },
    { g: 'hardware', t: 'Microduck Replica Kit', u: 'https://github.com/qianen6/microduck-replica-kit', d: 'Separates upstream facts from derivations and open questions; staged BOM.' },
    { g: 'hardware', t: 'microduck-community-kit (boards)', u: 'https://github.com/jyg9/microduck-community-kit', d: 'The boards a replica is missing: imu_to_dxl sensor board, battery board, bus hub, Feetech debugger.' },
    { g: 'hardware', t: 'microduck_imu_to_ttl', u: 'https://github.com/avanx/microduck_imu_to_ttl', d: 'Open-hardware IMU-on-the-servo-bus board (LSM6DSV16X), schematic published.' },
    { g: 'hardware', t: 'Microduck-S288 (Unitree servos)', u: 'https://github.com/zj281136/microduck-s288', d: 'Replica on fifteen Unitree S288 motors and a Pi Zero 2 W with no custom PCB.' },
    { g: 'hardware', t: 'Dukki (Unitree J288 rework)', u: 'https://github.com/lachlanhurst/dukki', d: 'KiCad boards, STM32 servo bridge, Radxa CM4 brain. Author flags it as far from complete.' },
    { g: 'hardware', t: 'RDK X5 MicroDuck (Feetech HD1910M)', u: 'https://github.com/Xiaomiju-x/rdk-x5-microduck', d: 'Physical prototype on cheaper Feetech servos; walk is a recorded sequence, not the full policy yet.' },
    { g: 'hardware', t: 'DuckBuddy (Feetech HL-2915)', u: 'https://github.com/Animan-AI/DuckBuddy', d: 'Independent build with retrained policies, offline speech, face tracking, running on the robot.' },
    { g: 'hardware', t: 'MicroDuck observer', u: 'https://github.com/Ley-WL/microduck-observer', d: 'Read-only dashboard for a physical build: IMU attitude on a 3D duck beside all fifteen servos.' },
    { g: 'hardware', t: 'Rhoban/bam (actuator identification)', u: 'https://github.com/Rhoban/bam', d: 'Build the pendulum bench and fit the friction model the Microduck policies are trained against.' },
    { g: 'hardware', t: 'Disney BDX paper (RSS 2024)', u: 'https://la.disneyresearch.com/publication/design-and-control-of-a-bipedal-robotic-character/', d: 'The droid both ducks imitate: character-driven mechanics, RL with artist-directed motion.' },
    // shops
    { g: 'shops', t: 'Evelta (Mumbai)', u: 'https://evelta.com/', d: 'Feetech ST3215 7.4 V ₹1,885 ex GST; STS3215-C046 ₹2,224 inc; Pi Zero 2 W ₹1,749; 7Semi BNO085 ₹1,775 ex. Checked 24 Oct 2026.' },
    { g: 'shops', t: 'Robocraze', u: 'https://robocraze.com/', d: 'Pi Zero 2 W ₹2,799 (₹3,299 with headers); BNO085 breakouts ₹2,095 to 2,399; BNO086 ₹2,349 to 2,525.' },
    { g: 'shops', t: 'Robu.in', u: 'https://robu.in/', d: 'Feetech bus servos, Waveshare adapters, IMUs, LiPo packs, bucks, screws, 3D-printing service.' },
    { g: 'shops', t: 'ThinkRobotics', u: 'https://thinkrobotics.com/', d: 'Raspberry Pi boards and robotics parts; publishes India stock guides.' },
    { g: 'shops', t: 'QuartzComponents', u: 'https://quartzcomponents.com/', d: 'Pi Zero 2 W and general electronics.' },
    { g: 'shops', t: 'ROBOTIS global store (Dynamixel)', u: 'https://en.robotis.com/', d: 'XL330-M288-T $23.90, OpenRB-150, U2D2, X3P cables. Ships internationally; duty and IGST apply.' },
    { g: 'shops', t: 'ROBOTIS America', u: 'https://robotis.us/products/dynamixel-xl330-m288-t', d: 'XL330-M288-T $27.49.' },
    { g: 'shops', t: 'Generation Robots (EU)', u: 'https://www.generationrobots.com/en/403817-dynamixel-xl330-m288-t-servo-motor.html', d: 'XL330-M288-T €33.50 ex VAT.' },
    { g: 'shops', t: 'OpenELAB', u: 'https://openelab.io/', d: 'Dynamixel and Feetech servos shipped from China; also publishes the build guides above.' },
    { g: 'shops', t: 'Seeed Studio (Feetech ST3215)', u: 'https://www.seeedstudio.com/Feetech-ST-3215-C044-Heavy-Duty-Servo-7-4V-1-191-Gear-Reduction-p-6460.html', d: 'The LeRobot-standard STS3215 variants, if Indian stock runs out.' },
    { g: 'shops', t: 'Radxa ZERO 3W', u: 'https://radxa.com/zero3w', d: 'The RK3566 board class the original is believed to use, if you want to match the SoC.' },
    // press
    { g: 'press', t: 'TechCrunch · launch', u: 'https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/', d: '27 Aug 2026.' },
    { g: 'press', t: 'CNBC · 10,000 units, Chinese chip', u: 'https://www.cnbc.com/2026/09/01/hugging-faces-new-duck-robot-is-selling-fast-a-chinese-chip-powers-it.html', d: '1 Sep 2026.' },
    { g: 'press', t: 'The Register · launch', u: 'https://www.theregister.com/ai-and-ml/2026/08/27/hugging-face-offers-399-robot-duck-to-help-you-quack-the-ai-code/5293011', d: 'Developer angle.' },
    { g: 'press', t: 'Engadget · pre-order details', u: 'https://www.engadget.com/2245407/huggingface-and-pollen-robotics-opn-pre-orders-for-the-microduck-robot/', d: 'Specs and pricing.' },
    { g: 'press', t: 'The New Stack · an RL teaching platform', u: 'https://thenewstack.io/hugging-face-microduck-robot/', d: 'Why the duck is a reinforcement-learning classroom.' },
    { g: 'press', t: 'IEEE Spectrum · Video Friday', u: 'https://spectrum.ieee.org/video-friday-microduck-robot', d: 'Feature.' },
    { g: 'press', t: 'Digital Trends · cheaper, less fragile physical AI', u: 'https://www.digitaltrends.com/cool-tech/pollen-robotics-microduck-aims-to-make-training-physical-ai-far-less-fragile-and-cheaper/', d: 'Launch-day interview angle.' },
    { g: 'press', t: 'MarkTechPost · the RL stack', u: 'https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/', d: 'Technical summary.' },
    { g: 'press', t: 'Interesting Engineering · learns from its mistakes', u: 'https://interestingengineering.com/ai-robotics/new-robot-duck-learn-from-its-mistakes', d: 'Fall recovery and the learning loop.' },
    { g: 'press', t: 'Hacker News · launch thread', u: 'https://news.ycombinator.com/item?id=49462763', d: '700+ points, Pollen engineers answering.' },
    { g: 'press', t: 'NDTV · GTC Berlin keynote', u: 'https://www.ndtv.com/world-news/nvidia-ceo-jensen-huang-showcases-ai-powered-microducks-that-sit-stand-and-nap-on-command-12223416', d: '21 Oct 2026.' },
    { g: 'press', t: 'NDTV Profit · Microducks steal the show', u: 'https://www.ndtvprofit.com/technology/microducks-steal-the-show-at-nvidias-gtc-berlin-keynote-demonstrate-ai-powered-robot-training-12220206', d: '21 Oct 2026.' },
    { g: 'press', t: 'Gadgets Now · RTX Spark training explained', u: 'https://gadgetsnow.indiatimes.com/tech-news/jensen-huang-wanted-a-robot-duck-to-do-a-somersault-all-about-nvidia-rtx-spark-training-hugging-faces-microduck-robot/amp_articleshow/135117547.cms', d: 'Indian coverage of the keynote.' },
    { g: 'press', t: 'TechRepublic · NVIDIA teaches a duck to walk', u: 'https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/', d: '22 Oct 2026, on the Isaac Lab walkthrough.' },
    { g: 'press', t: 'Hackster · Microduck wants to make physical AI easy', u: 'https://www.hackster.io/news/microduck-wants-to-make-physical-ai-easy-a10f0a915af1', d: 'Maker-community framing.' },
    { g: 'press', t: 'AInvest · the duck is an option, not the business', u: 'https://www.ainvest.com/news/nvidia-somersaulting-duck-option-business-decomposing-gtc-berlin-robot-demo-89-billion-quarter-2610/', d: 'Sceptical read of the demo against NVIDIA\'s quarter.' },
    { g: 'press', t: 'Pointcast 031', u: 'https://mhoydich.github.io/pointcast-microduck/', d: 'Long-form feature on the hardware, the open stack and programming behaviour with agents.' },
    { g: 'press', t: 'WhatDuck (learning site, Chinese)', u: 'https://duck.whatled.com', d: 'Four handbooks, a thirty-lesson course, 200 deep readings of the code and hardware.' },
    // video
    { g: 'video', t: '“We made a new robot.” · launch film', u: 'https://www.youtube.com/watch?v=RAtzEyGBGFU', d: 'Pollen Robotics.' },
    { g: 'video', t: 'Meet Microduck, the $399 Tiny Robot You Can Teach New Tricks', u: 'https://www.youtube.com/watch?v=reiTh7K4KSc', d: 'Official product overview.' },
    { g: 'video', t: 'Microduck Sim 2 Real', u: 'https://www.youtube.com/watch?v=szW7N_7B3tU', d: 'Official side-by-side of simulation and the robot.' },
    { g: 'video', t: 'Bloomberg Tech · Hugging Face pushes deeper into robotics', u: 'https://www.youtube.com/watch?v=LF7GmLKgvcc', d: 'Business framing.' },
    { g: 'video', t: 'Global News · the growing market of AI toys', u: 'https://www.youtube.com/watch?v=i_IMO0knP3I', d: 'Consumer framing.' },
    { g: 'video', t: 'Pollen Robotics on YouTube', u: 'https://www.youtube.com/@PollenRobotics', d: 'Official channel; sim-to-real clips land here first.' },
    // community & lineage
    { g: 'community', t: 'Pollen Discord', u: 'https://discord.com/invite/pollen-community-519098054377340948', d: 'The Microduck channels are where the team answers questions.' },
    { g: 'community', t: 'Open Duck Discord', u: 'https://discord.gg/UtJZsgfQGe', d: 'The Open Duck Mini community: builds, actuator models, sim-to-real lessons.' },
    { g: 'community', t: 'awesome-microduck', u: 'https://github.com/joeynyc/awesome-microduck', d: 'The curated list this guide draws on; 200+ projects with an ecosystem-status note.' },
    { g: 'community', t: '@pollenrobotics on X', u: 'https://x.com/pollenrobotics', d: 'Official account.' },
    { g: 'community', t: 'Open Duck Mini (lineage)', u: 'https://github.com/apirrone/Open_Duck_Mini', d: 'Antoine Pirrone\'s open-hardware BDX-style droid, the direct ancestor.' },
    { g: 'community', t: 'microduck_runtime (legacy prototype)', u: 'https://github.com/TommyZihao/microduck_runtime', d: 'Pre-launch Raspberry Pi runtime for the Microduck prototype, superseded by the official repo.' },
    { g: 'community', t: 'microduck_maploc_rs', u: 'https://github.com/apirrone/microduck_maploc_rs', d: 'ToF submap SLAM, relocalisation and A* planning in Rust, by a Pollen engineer.' },
    { g: 'community', t: 'Hugging Face Robotics Course (LeRobot)', u: 'https://huggingface.co/learn/robotics-course/en/unit0/1', d: 'Free course from classical to learning-based robotics.' },
    { g: 'community', t: 'Hugging Face Deep RL Course', u: 'https://huggingface.co/learn/deep-rl-course/unit0/introduction', d: 'Free course; Unit 8 is PPO.' }
  ];

  var groupsEl = document.getElementById('resGroups');
  var countEl = document.getElementById('resCount');
  var searchEl = document.getElementById('resSearch');
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filters .fb'));
  var activeFilter = 'all';

  function renderResources() {
    var q = (searchEl.value || '').trim().toLowerCase();
    groupsEl.innerHTML = '';
    var shown = 0;
    GROUPS.forEach(function (G) {
      if (activeFilter !== 'all' && activeFilter !== G[0]) return;
      var items = RES.filter(function (r) {
        if (r.g !== G[0]) return false;
        if (!q) return true;
        return (r.t + ' ' + r.d + ' ' + r.u).toLowerCase().indexOf(q) !== -1;
      });
      if (!items.length) return;
      shown += items.length;
      var sec = document.createElement('section');
      sec.className = 'res-group';
      var h = document.createElement('h3');
      h.innerHTML = esc(G[1]) + ' <small>' + items.length + '</small>';
      sec.appendChild(h);
      var ul = document.createElement('ul');
      ul.className = 'res-list';
      items.forEach(function (r) {
        var li = document.createElement('li');
        var tags = (r.tags || []).map(function (t) { return '<span class="chip tag">' + esc(t) + '</span>'; }).join('');
        li.innerHTML = '<div class="t"><a href="' + esc(r.u) + '" rel="noopener">' + esc(r.t) + '</a></div><div class="d">' + esc(r.d) + '</div><div class="m">' + tags + '</div>';
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      groupsEl.appendChild(sec);
    });
    countEl.textContent = shown + ' of ' + RES.length + ' entries';
  }
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      activeFilter = b.getAttribute('data-filter');
      filterBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      renderResources();
    });
  });
  searchEl.addEventListener('input', renderResources);
  renderResources();
})();
