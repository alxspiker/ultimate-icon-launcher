document.addEventListener('DOMContentLoaded', () => {
    const iconRing = document.querySelector('.icon-ring');
    const selectedAppLabel = document.getElementById('selected-app-label');
    const resizer = document.querySelector('.resizer');
    const iconRingContainer = document.querySelector('.icon-ring-container');

    // Updated icon data from the repository
    const icons = [
        { name: 'AppIcon 2-i', src: 'AppIcon 2-i.png' },
        { name: 'AppIcon 3-i', src: 'AppIcon 3-i.png' },
        { name: 'AppIcon 3', src: 'AppIcon 3.png' },
        { name: 'AppIcon 4-i', src: 'AppIcon 4-i.png' },
        { name: 'AppIcon 4', src: 'AppIcon 4.png' },
        { name: 'AppIcon 5-i', src: 'AppIcon 5-i.png' },
        { name: 'AppIcon 5', src: 'AppIcon 5.png' },
        { name: 'AppIcon 6-i', src: 'AppIcon 6-i.png' },
        { name: 'AppIcon 6', src: 'AppIcon 6.png' },
        { name: 'AppIcon 7', src: 'AppIcon 7.png' },
        { name: 'AppIcon 8', src: 'AppIcon 8.png' },
        { name: 'AppIcon-Release-i', src: 'AppIcon-Release-i.png' },
        { name: 'AppIcon-i', src: 'AppIcon-i.png' },
        { name: 'Code', src: 'Code.png' },
        { name: 'Cursor', src: 'Cursor.png' },
        { name: 'Icon 2-i', src: 'Icon 2-i.png' },
        { name: 'Trae-i', src: 'Trae-i.png' },
        { name: 'Warp-i', src: 'Warp-i.png' },
        { name: 'Windsurf', src: 'Windsurf.png' },
        { name: 'Xcode', src: 'Xcode.png' },
        { name: 'Zed', src: 'Zed.png' },
        { name: 'app', src: 'app.png' },
        { name: 'appIcon', src: 'appIcon.png' },
        { name: 'cyberduck-application-rect', src: 'cyberduck-application-rect.png' },
        { name: 'electron-i', src: 'electron-i.png' },
        { name: 'electron', src: 'electron.png' },
        { name: 'firefox', src: 'firefox.png' },
        { name: 'icon-i', src: 'icon-i.png' },
        { name: 'icon', src: 'icon.png' }
    ];

    let iconElements = [];

    function updateLayout() {
        const ringRect = iconRing.getBoundingClientRect();
        const ringRadius = Math.min(ringRect.width, ringRect.height) / 2 * 0.85; // 85% of half the smallest dimension
        // Ensure centerDotSizeRatio is correctly parsed, provide a default if CSS variable is missing
        const centerDotSizeRatioString = getComputedStyle(document.documentElement).getPropertyValue('--center-dot-size-ratio').trim();
        const centerDotSizeRatio = parseFloat(centerDotSizeRatioString) || 0.3;
        const centerDotSize = Math.min(ringRect.width, ringRect.height) * centerDotSizeRatio;
        
        document.documentElement.style.setProperty('--item-size', `${Math.max(20, Math.min(60, ringRadius / 3))}px`);
        document.documentElement.style.setProperty('--icon-image-size', `${Math.max(15, Math.min(40, ringRadius / 4))}px`);

        iconElements.forEach((item, index) => {
            const angle = (index / icons.length) * 2 * Math.PI - (Math.PI / 2); // Start from top
            const x = ringRadius * Math.cos(angle);
            const y = ringRadius * Math.sin(angle);

            // Base transform for positioning
            let transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            
            // Optional: make icons face outwards
            // transform += ` rotate(${angle + Math.PI/2}rad)`;
            
            item.style.transform = transform;
            item.dataset.baseTransform = transform; // Store base transform for reset
        });
    }

    function createIcons() {
        iconRing.innerHTML = ''; // Clear existing icons
        iconElements = [];

        icons.forEach((iconData, index) => {
            const item = document.createElement('div');
            item.classList.add('icon-item');
            item.dataset.index = index;
            item.title = iconData.name;

            const img = document.createElement('img');
            img.src = `icons/${iconData.src}`;
            img.alt = iconData.name;
            img.onerror = () => { img.style.display = 'none'; item.style.backgroundColor = '#eee'; }; // Basic error handling
            item.appendChild(img);

            item.addEventListener('mouseenter', () => handleMouseEnter(item, iconData, index));
            item.addEventListener('mouseleave', () => handleMouseLeave(item, index));

            iconRing.appendChild(item);
            iconElements.push(item);
        });
        updateLayout();
    }

    function handleMouseEnter(item, iconData, index) {
        item.classList.add('hovered');
        selectedAppLabel.textContent = iconData.name;
        selectedAppLabel.style.opacity = '1';

        const schoochDistanceFactor = 0.2; // How much to move neighbors, relative to item size
        const itemSize = parseFloat(getComputedStyle(item).width);
        const schoochDistance = itemSize * schoochDistanceFactor;

        // Function to apply schooch
        const applySchooch = (targetItem, direction) => {
            if (!targetItem) return;
            const baseTransform = targetItem.dataset.baseTransform;
            const currentAngle = (parseFloat(targetItem.dataset.index) / icons.length) * 2 * Math.PI - (Math.PI / 2);
            
            // Calculate schooch along the tangent of the circle for a more natural movement
            // For previous item, schooch "backwards" along tangent; for next, "forwards"
            const tangentAngle = currentAngle + (direction * Math.PI / 2); 
            const schoochX = schoochDistance * Math.cos(tangentAngle) * direction; // direction determines push away or pull towards center based on tangent
            const schoochY = schoochDistance * Math.sin(tangentAngle) * direction;

            targetItem.style.transform = `${baseTransform} translate(${schoochX}px, ${schoochY}px)`;
            targetItem.classList.add(direction > 0 ? 'schooched-prev' : 'schooched-next'); // Class names might seem reversed by logic
        };
        
        const prevIndex = (index - 1 + icons.length) % icons.length;
        const nextIndex = (index + 1) % icons.length;

        applySchooch(iconElements[prevIndex], 1); // Schooch previous item
        applySchooch(iconElements[nextIndex], -1); // Schooch next item
    }

    function handleMouseLeave(item, index) {
        item.classList.remove('hovered');
        selectedAppLabel.style.opacity = '0';

        const resetSchooch = (targetItem) => {
            if (targetItem && (targetItem.classList.contains('schooched-prev') || targetItem.classList.contains('schooched-next'))) {
                targetItem.style.transform = targetItem.dataset.baseTransform;
                targetItem.classList.remove('schooched-prev', 'schooched-next');
            }
        };

        const prevIndex = (index - 1 + icons.length) % icons.length;
        const nextIndex = (index + 1) % icons.length;
        
        resetSchooch(iconElements[prevIndex]);
        resetSchooch(iconElements[nextIndex]);
    }
    
    // Initial setup
    createIcons();

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const resizerRect = entry.contentRect;
            iconRingContainer.style.width = `${resizerRect.width * 0.9}px`;
            iconRingContainer.style.height = `${resizerRect.height * 0.9}px`;
            updateLayout();
        }
    });

    if (resizer) {
        resizeObserver.observe(resizer);
    }
    
    window.addEventListener('resize', () => {
        // Fallback or additional trigger for layout update if not covered by ResizeObserver
        // This ensures that if the window resizes causing the .resizer to change %-based dimensions, we catch it.
        const resizerRect = resizer.getBoundingClientRect();
         iconRingContainer.style.width = `${resizerRect.width * 0.9}px`;
         iconRingContainer.style.height = `${resizerRect.height * 0.9}px`;
        updateLayout();
    });
});
