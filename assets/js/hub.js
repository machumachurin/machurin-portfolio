document.addEventListener('DOMContentLoaded', () => {
    /* 
     * 初期ロード時のフェードアップアニメーション
     * ・・hub.cssの .fade-up クラスと連携・・
     */
    const fadeElements = document.querySelectorAll('.fade-up');

    // ロード直後に少し時間差をつけてアニメーション開始を確実にする
    setTimeout(() => {
        fadeElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }, 100);

    /* 
     * パーティクル（光のオーブ）のマウス追従エフェクト（微視差）
     * プレミアム感を高めるためのマイクロインタラクション
     */
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        // オーブをマウスと逆方向に少しだけ動かす
        if (orb1) orb1.style.transform = `translate(${mouseX * -50}px, ${mouseY * -50}px)`;
        if (orb2) orb2.style.transform = `translate(${mouseX * 80}px, ${mouseY * 80}px)`;
    });

    /* 
     * ページ遷移時のフェードアウトエフェクト（カスタマイズ用）
     * ここではaタグのデフォルト挙動を少し遅延させてトランジションを見せる例
     */
    const portalLinks = document.querySelectorAll('.portal-card');

    portalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // e.preventDefault();
            // const target = link.getAttribute('href');
            // document.body.style.opacity = 0;
            // setTimeout(() => {
            //    window.location.href = target;
            // }, 500);
        });
    });

    /* 
     * 讓ｪ繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ繝懊ち繝ｳ・・etflix鬚ｨ・峨・蛻ｶ蠕｡
     */
    document.querySelectorAll('.portals-section').forEach(section => {
        const container = section.querySelector('.portals-container');
        const leftBtn = section.querySelector('.left-btn');
        const rightBtn = section.querySelector('.right-btn');

        if (!container || !leftBtn || !rightBtn) return;

        const firstCard = container.querySelector('.portal-card');

        // ==== カスタムアニメーションで確実に滑らかにスクロールさせる ====
        let isAnimating = false;

        function animateScroll(amount) {
            if (isAnimating) return;
            isAnimating = true;

            const start = container.scrollLeft;
            const duration = 400; // スクロールにかける時間（ミリ秒）
            let startTime = null;

            // スナップが効いているとJSのスクロールと衝突してアニメーションが無効化されるため、一時的に解除する
            container.style.scrollSnapType = 'none';

            // 滑らかな加減速（イージング関数）
            function easeInOutQuad(t) {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);

                container.scrollLeft = start + amount * easeInOutQuad(progress);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    isAnimating = false;
                    // アニメーション完了後にスナップ機能を戻す
                    container.style.scrollSnapType = 'x mandatory';
                }
            }

            window.requestAnimationFrame(step);
        }

        leftBtn.addEventListener('click', () => {
            // 矢印クリックでスクロールする量（カード1枚分 + 余白）
            const gap = parseFloat(window.getComputedStyle(container).gap) || 20;
            const scrollAmount = firstCard ? (firstCard.offsetWidth + gap) : 300;
            animateScroll(-scrollAmount);
        });

        rightBtn.addEventListener('click', () => {
            // 矢印クリックでスクロールする量（カード1枚分 + 余白）
            const gap = parseFloat(window.getComputedStyle(container).gap) || 20;
            const scrollAmount = firstCard ? (firstCard.offsetWidth + gap) : 300;
            animateScroll(scrollAmount);
        });
    });

    /* 
     * 横スクロール中央検知（カバースワップ風エフェクト）
     */
    const updateCenterCards = () => {
        document.querySelectorAll('.portals-container').forEach(container => {
            const cards = container.querySelectorAll('.portal-card');
            if (cards.length === 0) return;

            const containerRect = container.getBoundingClientRect();
            // コンテナの画面上の中心X座標
            const containerCenter = containerRect.left + container.offsetWidth / 2;

            let minDistance = Infinity;
            let centerCard = null;

            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                // カード自体の画面上の中心X座標
                const cardCenter = cardRect.left + card.offsetWidth / 2;
                const distance = Math.abs(containerCenter - cardCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    centerCard = card;
                }
            });

            cards.forEach(card => {
                if (card === centerCard) {
                    card.classList.add('is-center');
                } else {
                    card.classList.remove('is-center');
                }
            });
        });
    };

    // スクロールイベントでリアルタイムに中央を判定する
    document.querySelectorAll('.portals-container').forEach(container => {
        container.addEventListener('scroll', () => {
            requestAnimationFrame(updateCenterCards);
        });
    });

    // リサイズ時も判定を更新
    window.addEventListener('resize', updateCenterCards);
    // 初期表示用に一度実行
    setTimeout(updateCenterCards, 100);

    /* 
     * スクロール位置の保存と復元（縦スクロール + 横スクロール）
     */
    function restoreScrollPositions() {
        const savedY = sessionStorage.getItem('hubScrollY');
        if (savedY !== null) {
            window.scrollTo({ top: parseFloat(savedY), behavior: 'instant' });
        }

        const savedXsStr = sessionStorage.getItem('hubScrollXs');
        if (savedXsStr !== null) {
            try {
                const savedXs = JSON.parse(savedXsStr);
                const containers = document.querySelectorAll('.portals-container');
                containers.forEach((container, index) => {
                    if (savedXs[index] !== undefined) {
                        // 横スクロール時にスナップが邪魔してズレるのを防ぐため、一時無効化
                        const prevSnap = container.style.scrollSnapType;
                        container.style.scrollSnapType = 'none';
                        container.scrollLeft = savedXs[index];
                        setTimeout(() => {
                            container.style.scrollSnapType = prevSnap;
                        }, 50);
                    }
                });
            } catch (e) {
                console.error('Scroll restore failed:', e);
            }
        }
    }

    // ページロード時に復元する
    restoreScrollPositions();

    // 別のページへ遷移する際（離脱直前）に、現在のスクロール位置を保存する
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('hubScrollY', window.scrollY);
        const containers = document.querySelectorAll('.portals-container');
        const scrollXs = [];
        containers.forEach(container => {
            scrollXs.push(container.scrollLeft);
        });
        sessionStorage.setItem('hubScrollXs', JSON.stringify(scrollXs));
    });

});

