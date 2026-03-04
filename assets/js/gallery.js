/**
 * Base Technical Model - JavaScript
 * Features:
 * 1. GSAP ScrollTrigger for scroll-linked animations
 * 2. Fetch API for real-time Twitch LIVE status
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       1. GSAP アニメーション
       ※gsapとScrollTriggerのCDNがHTMLに読み込まれている前提
    ========================================================= */
    gsap.registerPlugin(ScrollTrigger);

    // 見出し（gsap-trigger-elem）を下からフェードインさせる共通アニメーション
    const triggerElements = document.querySelectorAll('.gsap-trigger-elem');
    triggerElements.forEach(elem => {
        gsap.to(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 80%", // 要素の上が、画面の上から80%の位置に来たら開始
                toggleActions: "play none none reverse" // スクロールアップで戻る
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // 左から入ってくるカード
    gsap.to('.slide-left', {
        scrollTrigger: {
            trigger: '.grid-layout',
            start: "top 75%",
        },
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "power2.out",
        // CSS側では opacity:0 にしてある。X: -50 などは `.from()` で指定すると楽
        startAt: { x: -100 }
    });

    // 下から入ってくるカード（少し遅延させる Stagger 的な効果）
    gsap.to('.slide-up', {
        scrollTrigger: {
            trigger: '.grid-layout',
            start: "top 75%",
        },
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: 0.2,
        ease: "power2.out",
        startAt: { y: 100 }
    });

    // パララックス（背景の丸いぼかしオーブがスクロールに連動して動く）
    gsap.to('.orb-1', {
        scrollTrigger: {
            trigger: '.gsap-section',
            start: "top bottom",
            end: "bottom top",
            scrub: 1 // scrubを入れるとスクロール量に完全に連動する
        },
        y: 200, // スクロールすると下に200pxズレていく（視差効果）
        ease: "none"
    });

    gsap.to('.orb-2', {
        scrollTrigger: {
            trigger: '.gsap-section',
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5
        },
        y: -150, // スクロールすると上に登っていく
        ease: "none"
    });


    /* =========================================================
       2. Real-time Twitch API Fetching
    ========================================================= */
    async function fetchTwitchStatus() {
        // 例としてポジポジ子ちゃんのチャンネルを監視
        const channelName = 'machumachurin';
        const badgeElem = document.getElementById('live-status-badge');

        try {
            // DecAPIを使ってCORSや複雑なToken認証をバイパスして状態を取得
            const res = await fetch(`https://decapi.me/twitch/uptime/${channelName}`);
            const text = await res.text();

            // 一瞬ローディングを見せるための遅延(UX演出)
            setTimeout(() => {
                badgeElem.classList.remove('loading');

                if (text.toLowerCase().includes('offline') || text.toLowerCase().includes('not live')) {
                    // オフライン
                    badgeElem.classList.add('offline');
                    badgeElem.innerHTML = '<i class="ph-bold ph-power"></i> OFFLINE';
                } else if (text.toLowerCase().includes('error')) {
                    // 取得エラー等
                    badgeElem.classList.add('offline');
                    badgeElem.innerHTML = '<i class="ph-bold ph-warning-circle"></i> STATUS UNKNOWN';
                } else {
                    // 配信中（数字が返ってくる＝配信時間）
                    badgeElem.classList.add('online');
                    badgeElem.innerHTML = '<i class="ph-fill ph-broadcast"></i> LIVE NOW <span style="font-size:0.8rem; opacity:0.8; margin-left:10px;">(' + text + ')</span>';
                }
            }, 1000);

        } catch (err) {
            console.error('Twitch Data Fetch Error:', err);
            badgeElem.classList.remove('loading');
            badgeElem.classList.add('offline');
            badgeElem.innerHTML = 'FETCH FAILED';
        }
    }

    // GSAPのトリガーを利用して、APIセクションが見えたときに初めてFetchを走らせる（無駄な帯域消費の防止）
    ScrollTrigger.create({
        trigger: '.api-section',
        start: "top 90%",
        once: true, // 1度だけ実行
        onEnter: () => fetchTwitchStatus()
    });

    /* =========================================================
       3. Custom Mouse Stalker (cursor follower)
    ========================================================= */
    const stalker = document.getElementById('mouse-stalker');
    if (stalker) {
        // マウスの動きに追従（少し遅らせて滑らかにするためGSAP不使用でもOKだがGSAPのQuickToが強力）
        let xTo = gsap.quickTo(stalker, "left", { duration: 0.2, ease: "power3" }),
            yTo = gsap.quickTo(stalker, "top", { duration: 0.2, ease: "power3" });

        window.addEventListener("mousemove", (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        });

        // リンクやボタンをホバーした際のアニメーションクラスの付与
        const hoverTargets = document.querySelectorAll('a, button, .action-btn');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                stalker.classList.add('is-hover');
            });
            target.addEventListener('mouseleave', () => {
                stalker.classList.remove('is-hover');
            });
        });
    }

    /* =========================================================
       4. 3D Tilt Effect on Cards
    ========================================================= */
    const tiltCards = document.querySelectorAll('.card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // カードの中心からのマウスの相対位置 (-1 to 1)
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

            // X軸, Y軸の回転量（最大15度などで調整）
            const rotateX = y * -15;
            const rotateY = x * 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.transition = 'none'; // 動かしている最中は即時反映
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease-out'; // 離れたときにフワッと戻す
        });
    });

    /* =========================================================
       5. GSAP Horizontal Scroll & Text Animation
    ========================================================= */
    const horizontalSec = document.getElementById('horizontal-sec');
    const horizontalContainer = document.getElementById('horizontal-container');

    if (horizontalSec && horizontalContainer) {

        // -------------------------
        // A. Horizontal Scroll conversion in box
        // -------------------------
        // ホバー中に縦スクロール（ホイール）を横スクロールに変換する
        horizontalContainer.addEventListener('wheel', (e) => {
            // e.deltaY が縦方向のスクロール量
            if (e.deltaY !== 0) {
                // コンテナの最大スクロール可能幅
                const maxScrollLeft = horizontalContainer.scrollWidth - horizontalContainer.clientWidth;

                // 左端にいて上スクロールしようとしている、または右端にいて下スクロールしようとしている場合
                // => 通常の縦スクロールを許可する（ページ全体がスクロールするようにする）
                if (horizontalContainer.scrollLeft <= 0 && e.deltaY < 0) return;
                if (horizontalContainer.scrollLeft >= maxScrollLeft && e.deltaY > 0) return;

                // それ以外はボックス内のスクロールとみなし、画面全体の縦スクロールを止めて横移動に変換
                e.preventDefault();
                horizontalContainer.scrollLeft += e.deltaY;
            }
        }, { passive: false }); // preventDefaultを呼ぶためにpassive: falseが必要

        // -------------------------
        // B. Text Animation (SplitText鬚ｨ)
        // -------------------------
        // ライブラリを使わず、JSでh2内のテキストを1文字ずつのspanに分解する
        const targetTextElem = horizontalSec.querySelector('.split-text-target');
        if (targetTextElem) {
            const text = targetTextElem.textContent;
            targetTextElem.innerHTML = '';

            // 1文字ずつ <span><span class="char">文字</span></span> で囲む（スペースも保持）
            [...text].forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char';
                // HTMLエンティティとしてスペースを扱う
                charSpan.innerHTML = char === ' ' ? '&nbsp;' : char;
                targetTextElem.appendChild(charSpan);
            });

            // GSAPで1文字ずつ降下アニメーション
            gsap.to(targetTextElem.querySelectorAll('.char'), {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.05, // 0.05秒ずつズラして再生
                ease: "back.out(1.7)", // 少し弾んで止まる
                scrollTrigger: {
                    trigger: horizontalSec,
                    // Horizontal Sectionが画面に入り始めたら即座にテキストアニメ開始
                    start: "top 60%",
                    toggleActions: "play none none reverse"
                }
            });
        }
    }

});

