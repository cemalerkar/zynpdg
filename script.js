// ===================================
//   FOTOĞRAF ÖN YÜKLEME FONKSİYONU
// ===================================
function preloadImages(imageUrls) {
    // Her bir resim URL'si için bir yükleme sözü (Promise) oluştur
    const promises = imageUrls.map(src => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            // Resim başarıyla yüklenince
            img.onload = () => {
                console.log(`Image loaded: ${src}`); // Konsolda görmek için
                resolve(img);
            };
            // Resim yüklenirken hata olursa
            img.onerror = () => {
                // GitHub'daki hatayı bulmak için bu çok önemli!
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Failed to load image: ${src}`));
            };
        });
    });
    
    // Tüm resimlerin yüklenmesini bekle
    return Promise.all(promises);
}


// ===================================
//   ANA UYGULAMA KODU
// ===================================
document.addEventListener('DOMContentLoaded', () => {

    const scenes = document.querySelectorAll('.scene');
    const userChoices = {
        items: [],
        person: '',
        dilemma: '',
        escapees: [],
        plan: ''
    };

    // Resimlerin yüklenip yüklenmediğini takip etmek için bir değişken
    let preloadingPromise = null;

    // Tüm sahneleri gizleyip isteneni gösteren fonksiyon (KAYDIRMA DÜZELTMESİ EKLENDİ)
    function showScene(sceneId) {
        scenes.forEach(scene => {
            scene.classList.remove('active');
        });
        document.getElementById(sceneId).classList.add('active');

        // Kaydırma gerektirmeyen, tam ekran olması gereken sahneler:
        const noScrollScenes = [
            'scene-start', 
            'scene-fake-loading', 
            'scene-photos', 
            'scene-is-it-over'
        ];

        if (noScrollScenes.includes(sceneId)) {
            // Bu sahnelerde kaydırmayı engelle ve ortala
            document.body.classList.add('no-scroll');
        } else {
            // Diğer tüm sahnelerde (soru, mektup vb.) kaydırmaya izin ver
            document.body.classList.remove('no-scroll');
        }
    }

    // --- Sahne 1: Başlangıç (ÖN YÜKLEME BAŞLATMA EKLENDİ) ---
    document.getElementById('btn-start').addEventListener('click', () => {
        showScene('scene-fake-loading');

        // --- Ön yüklemeyi başlat ---
        const imagesToLoad = [
            '1.png', '2.png', '3.png', '4.png', '5.png',
            '6.png', '7.png', '8.png', '9.png'
        ];
        
        // Yüklemeyi başlat ve sonucu 'preloadingPromise' değişkenine kaydet
        preloadingPromise = preloadImages(imagesToLoad).catch(error => {
            console.error("Resimler yüklenirken hata oluştu:", error);
        });
        // --------------------------

        setTimeout(() => {
            document.getElementById('loading-text').style.display = 'none';
            document.getElementById('error1-text').style.display = 'block';
        }, 2000);
    });

    // --- Sahne 2: Sahte Hata 1 (ÖN YÜKLEMEYİ BEKLEME EKLENDİ) ---
    document.getElementById('btn-go-back').addEventListener('click', async () => {
        
        // Butona "Bekle" mesajı verelim
        const goBackButton = document.getElementById('btn-go-back');
        goBackButton.textContent = 'Fotoğraflar Hazırlanıyor...';
        goBackButton.disabled = true;

        try {
            // Sahne 1'de başlayan resim yüklemesinin bitmesini bekle
            await preloadingPromise;
            console.log("Tüm resimler yüklendi, fotoğraf sahnesi başlıyor.");
        
            // Yükleme bittikten sonra fotoğraf sahnesine geç
            startPhotoSequence();
        
        } catch (error) {
            console.error("Ön yükleme başarısız oldu ama yine de devam ediliyor:", error);
            // Hata olsa bile fotoğraf sahnesine geçmeyi dene
            startPhotoSequence();
        }
    });

    // --- Sahne 3: Fotoğraflar ---
    function startPhotoSequence() {
        showScene('scene-photos');
        const photoContainer = document.getElementById('scene-photos');
        const totalPhotos = 9;
        
        for (let i = 1; i <= 4; i++) {
            setTimeout(() => {
                createFallingPhoto(i, photoContainer);
            }, (i - 1) * 2000);
        }

        setTimeout(() => {
            document.getElementById('error2-text').style.animation = 'fadeIn 1s forwards';
        }, 7000);

        setTimeout(() => {
             for (let i = 5; i <= totalPhotos; i++) {
                setTimeout(() => {
                    createFallingPhoto(i, photoContainer);
                }, (i - 5) * 1800);
            }
        }, 9000);

        setTimeout(() => {
             showScene('scene-is-it-over');
        }, 20000);
    }

    function createFallingPhoto(index, container) {
        const img = document.createElement('img');
        img.src = `${index}.png`;
        img.className = 'falling-photo';
        img.style.left = `${Math.random() * 80 + 10}%`;
        img.style.animationDuration = `${Math.random() * 4 + 6}s`;
        container.appendChild(img);
    }
    
    // --- Sahne 4: Bitti mi? ---
    const isItOverButtons = document.querySelectorAll('#scene-is-it-over .choice-btn'); 
    isItOverButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('btn-not-over').textContent = 'Bitmemiş Bitmemiş';
            document.getElementById('btn-what-else').textContent = 'Bitmemiş Bitmemiş';
            setTimeout(() => {
                showScene('scene-island-items');
            }, 500);
        });
    });

    // --- Sahne 5: Eşya Seçimi ---
    const itemCheckboxes = document.querySelectorAll('#item-options input[type="checkbox"]');
    const btnItemsContinue = document.getElementById('btn-items-continue');
    const itemWarning = document.getElementById('item-warning');

    itemCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedCount = document.querySelectorAll('#item-options input[type="checkbox"]:checked').length;
            if (selectedCount === 3) {
                btnItemsContinue.disabled = false;
                itemWarning.style.visibility = 'hidden';
            } else {
                btnItemsContinue.disabled = true;
                itemWarning.style.visibility = 'visible';
            }
        });
    });

    btnItemsContinue.addEventListener('click', () => {
        userChoices.items = Array.from(document.querySelectorAll('#item-options input:checked')).map(cb => cb.value);
        showScene('scene-island-person');
    });

    // --- Sahne 6: Kişi Seçimi ---
    const personRadios = document.querySelectorAll('#person-options input[type="radio"]');
    const btnPersonContinue = document.getElementById('btn-person-continue');

    personRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            btnPersonContinue.disabled = false;
        });
    });

    btnPersonContinue.addEventListener('click', () => {
        userChoices.person = document.querySelector('#person-options input:checked').value;
        const dilemmaQuestion = document.getElementById('dilemma-question');
        dilemmaQuestion.textContent = `${userChoices.person} beraber adadan kaçmanız gerektiğini söylüyor, ama kaçarsanız seçeceğiniz 2 kişi hariç tüm dünyadaki insanların öleceğini biliyorsunuz, kaçacak mısınız?`;
        showScene('scene-dilemma');
    });

    // --- Sahne 7: İkilem ---
    document.getElementById('btn-escape').addEventListener('click', () => {
        userChoices.dilemma = 'kaçtı';
        populateEscapePeopleOptions();
        showScene('scene-escape-people');
    });

    document.getElementById('btn-stay').addEventListener('click', () => {
        userChoices.dilemma = 'kaçmadı';
        document.getElementById('activity-question').textContent = 'Adada memnunsunuz demek, peki adada ne yapmayı planlıyorsunuz?';
        showScene('scene-activity-plan');
    });
    
    // --- Sahne 8a: Kurtarılacak Kişiler ---
    function populateEscapePeopleOptions() {
        const allPeople = Array.from(personRadios).map(r => r.value);
        const availablePeople = allPeople.filter(p => p !== userChoices.person);
        const container = document.getElementById('escape-people-options');
        container.innerHTML = '';
        availablePeople.forEach(person => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="escapee" value="${person}"> ${person}`;
            container.appendChild(label);
        });

        const escapeCheckboxes = document.querySelectorAll('#escape-people-options input');
        escapeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selectedCount = document.querySelectorAll('#escape-people-options input:checked').length;
                document.getElementById('btn-escape-people-continue').disabled = selectedCount !== 2;
                document.getElementById('escape-warning').style.visibility = selectedCount !== 2 ? 'visible' : 'hidden';
            });
        });
    }
    
    document.getElementById('btn-escape-people-continue').addEventListener('click', () => {
        userChoices.escapees = Array.from(document.querySelectorAll('#escape-people-options input:checked')).map(cb => cb.value);
        document.getElementById('activity-question').textContent = 'Şehire ulaştınız, şimdi ne yapmayı planlıyorsunuz?';
        showScene('scene-activity-plan');
    });

    // --- Sahne 8b/9: Aktivite ---
    document.querySelectorAll('.plan-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            userChoices.plan = e.target.textContent;
            generateFinalStory();
            showScene('scene-final-story');
        });
    });

    // --- Sahne 10: Final Hikayesi ---
    function generateFinalStory() {
        let story = `Bir gün Zeynep adlı bir kız 22 yaşına gireyim derken bir hata ile karşılaşıyor ve simülasyonun içine düşüp adada mahsur kalıyor, yanına ${userChoices.items.join(', ')} alıyor ve onunla birlikte ${userChoices.person}'nin gelmesini istiyor. ${userChoices.person} biraz tereddütte kalsa da onu kıramayıp "Hadi gel gidelim ne olacaksa olsun" diyor. Daha sonra adadan kaçma fırsatı ellerine geçince Zeynep ikilemde kalıyor ama asla ${userChoices.person} ile danışmıyor, kendi kendine adadan ${userChoices.dilemma} seçeneğine razı olduğunu söylüyor. `;

        if (userChoices.dilemma === 'kaçtı') {
            story += `Adadan kaçmak tabi insanları tehlikeye atacak olsa da Zeynep "yanımda ${userChoices.person}, ${userChoices.escapees.join(' ve ')} olduğu sürece sıkıntı yok" dedi. `;
        }

        story += `Bir süre oralarda takılınca Zeynep '${userChoices.plan}' yapmaya karar verdi. `;

        let planStory = '';
        switch (userChoices.plan) {
            case 'Hiiç takılırız':
                planStory = "Bu 'hiçlik' halinin verdiği huzurla kumsalda amaçsızca yürüyorlardı. Ayaklarının altındaki kumun ve dalgaların sesinin tadını çıkarırken, ileride parlayan garip bir anomali gözlerine çarptı.";
                break;
            case 'Aktivite ararız':
                planStory = "Macera ruhları kabarmıştı, adanın gizemli iç kısımlarına doğru keşfe çıktılar. Patikaları takip edip eski kalıntıları incelerken, iki kadim ağacın arasında titreşen bir enerji alanı fark ettiler.";
                break;
            case 'İlla bir şey mi yapmamız gerek':
                planStory = "Bu anlamsız koşuşturmacanın gereksiz olduğunu düşünüp, en yakın gölgeliğe uzandılar. Hayatın anlamını sorgularken, tam da yattıkları yerin üzerindeki kayalıklarda bir girdabın yavaşça oluştuğunu gördüler.";
                break;
            case 'Güneşlenmem lazım':
                planStory = "Zeynep, 'Bronzlaşmadan bu adadan dönmem!' diyerek en güzel güneşli köşeyi kaptı. Gözleri kapalı bir şekilde D vitamininin keyfini sürerken, ansızın gelen bir serinlik ve uğultuyla gözlerini açtığında hemen yanı başında bir portalın belirdiğini gördü.";
                break;
            case 'Story atıcam 1 saniye':
                planStory = "Hemen telefonunu çıkarıp 'Ada Hayatı #NoFilter' notuyla en estetik açıyı bulmaya çalıştı. Tam mükemmel pozu yakalamak için kamerasını çevirdiğinde, ekranda beliren AR filtresi sandığı şeyin aslında gerçek bir portal olduğunu fark etti.";               break;
        }
        story += planStory;

        story += ` Daha sonra bir portala denk geldiler ve Zeynep içeri daldı. Saatine baktı 23:59'du. 28 Ekim 2025 tarihinde olduğunu tam fark ederken 00:00 oldu. Her yer konfeti ve havai fişeklerle dolmaya başladı. Herkes tek bir ağızdan ona "Doğum Günün Kutlu Olsun Zeyneep" diyordu. Bu kadar fazla kişi nasıl toplanmıştı bilmiyordu. Önüne bir zarf geldi ve zarfı açmaya başladı.`;
        
        document.getElementById('final-story-text').textContent = story;
    }
    
    document.getElementById('btn-read-envelope').addEventListener('click', () => {
        showScene('scene-letter');
    });

    // Başlangıç sahnesini göster
    showScene('scene-start');
});

// ===================================
//   VİDEO OYNATICI KODLARI (BLOB)
// ===================================

document.addEventListener('DOMContentLoaded', () => {

    // Gerekli HTML elementlerini seçelim
    const videoModal = document.getElementById('video-modal');
    const playButton = document.getElementById('btn-play-video');
    const closeButton = document.getElementById('btn-close-video');
    const video = document.getElementById('birthday-video');

    // ÖNEMLİ: video.mp4 yazan yeri kendi video dosyanızın yolu ve adıyla değiştirin.
    const videoDosyaYolu = 'video.mp4'; 
    
    // Videonun geçici URL'sini saklamak için bir değişken
    let videoBlobURL = null; 

    // Elementlerin bulunup bulunmadığını kontrol edelim
    if (playButton && videoModal && closeButton && video) {
        
        // "Edit Zamanı Geldi..." linkine tıklanınca...
        playButton.addEventListener('click', async (e) => {
            e.preventDefault(); 
            videoModal.style.display = 'flex'; // Video penceresini görünür yap

            try {
                // 1. Videoyu daha önce yüklemediysek (ilk tıklama)
                if (!videoBlobURL) {
                    console.log("Video yükleniyor...");
                    
                    // Videoyu 'fetch' komutuyla bir veri yığını (blob) olarak çekiyoruz
                    const response = await fetch(videoDosyaYolu);
                    
                    if (!response.ok) {
                        throw new Error(`Video dosyası yüklenemedi: ${response.statusText} (Dosya yolu: ${videoDosyaYolu})`);
                    }
                    
                    const videoBlob = await response.blob();
                    
                    // Veri yığınından geçici, tarayıcının kullanabileceği bir URL oluşturuyoruz
                    videoBlobURL = URL.createObjectURL(videoBlob);
                    console.log("Video geçici URL oluşturuldu.");
                }
                
                // 2. Videonun kaynağını (src) bu geçici URL olarak ayarla
                video.src = videoBlobURL;
                
                // 3. Videoyu oynat
                video.play();

            } catch (error) {
                console.error('Video yükleme hatası:', error);
                // Hata mesajını doğrudan ekrana da yazdırabiliriz
                const errorText = document.createElement('p');
                errorText.style.color = 'red';
                errorText.innerText = `HATA: Video yüklenemedi. Dosya yolunu kontrol edin: ${videoDosyaYolu}`;
                video.parentElement.prepend(errorText); // Hata mesajını video modalına ekle
            }
        });

        // Kapatma (X) butonuna tıklanınca...
        closeButton.addEventListener('click', () => {
            videoModal.style.display = 'none'; // Video penceresini gizle
            video.pause(); // Videoyu duraklat
            video.currentTime = 0; // Videoyu başa sar
        });

        // Opsiyonel: Siyah arka plana tıklayınca da kapat
        videoModal.addEventListener('click', (e) => {
            // Eğer tıklanan yer videonun kendisi değil de dışarıdaki siyah alansa...
            if (e.target === videoModal) { 
                videoModal.style.display = 'none';
                video.pause();
                video.currentTime = 0;
            }
        });

    } else {
        console.error('Video modal elementleri bulunamadı. HTML idlerini kontrol edin.');
   }
});
