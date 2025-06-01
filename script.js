document.addEventListener('DOMContentLoaded', () => {
    const iconRing = document.querySelector('.icon-ring');
    const selectedAppLabel = document.getElementById('selected-app-label');
    const resizer = document.querySelector('.resizer');
    const iconRingContainer = document.querySelector('.icon-ring-container');

    // Sample icon data (replace with your actual icons)
    // Ensure you have these images in an 'icons/' folder relative to index.html
    const icons = [
        { name: 'Sketch', src: 'app.png' },
        { name: 'Wave', src: 'AppIcon 2-i.png' },
        { name: 'Ghostty', src: 'AppIcon 3-i.png' },
        { name: 'VSCode', src: 'AppIcon 3.png' },
        { name: 'Inna', src: 'AppIcon 4-i.png' },
        { name: 'Bartender', src: 'AppIcon 4.png' },
        { name: 'TV', src: 'AppIcon 5-i.png' },
        { name: 'Tables Plus', src: 'AppIcon 5.png' },
        { name: 'OBS', src: 'AppIcon 6-i.png' },
        { name: 'Wes Bos', src: 'AppIcon 6.png' },
        { name: 'Popsicle', src: 'AppIcon 7.png' },
        { name: 'Mail', src: 'AppIcon 8.png' },
        { name: 'Firefox', src: 'firefox.png' },
        { name: 'Xcode', src: 'Xcode.png' },
        { name: 'Zed', src: 'Zed.png' }
    ];

    let iconElements = [];

    function updateLayout() {
        const ringRect = iconRing.getBoundingClientRect();
        const ringRadius = Math.min(ringRect.width, ringRect.height) / 2 * 0.85; // 85% of half the smallest dimension
        const centerDotSize = Math.min(ringRect.width, ringRect.height) * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--center-dot-size-ratio') || '0.3');
        
        document.documentElement.style.setProperty('--item-size', `${Math.min(60, ringRadius / 3)}px`);
        document.documentElement.style.setProperty('--icon-image-size', `${Math.min(40, ringRadius / 4)}px`);


        iconElements.forEach((item, index) => {
            const angle = (index / icons.length) * 2 * Math.PI - (Math.PI / 2); // Start from top
            const x = ringRadius * Math.cos(angle);
            const y = ringRadius * Math.sin(angle);

            item.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            // To make icons face outwards (optional)
            // item.style.transform += ` rotate(${angle + Math.PI/2}rad)`;
        });
    }


    function createIcons() {
        iconRing.innerHTML = ''; // Clear existing icons
        iconElements = [];

        icons.forEach((iconData, index) => {
            const item = document.createElement('div');
            item.classList.add('icon-item');
            item.dataset.index = index;
            item.title = iconData.name; // For default browser tooltip, can be styled too

            const img = document.createElement('img');
            img.src = `icons/${iconData.src}`; // Assuming icons are in an 'icons' folder
            img.alt = iconData.name;
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

        // Schooch effect
        const prevIndex = (index - 1 + icons.length) % icons.length;
        const nextIndex = (index + 1) % icons.length;

        const schoochStrength = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--item-size')) * 0.3; // 30% of item size

        if (iconElements[prevIndex]) {
            const prevAngle = (prevIndex / icons.length) * 2 * Math.PI - (Math.PI / 2);
            const schoochX = -schoochStrength * Math.cos(prevAngle);
            const schoochY = -schoochStrength * Math.sin(prevAngle);
            const originalTransform = iconElements[prevIndex].style.transform.split('translate(-50%, -50%)')[0];
            iconElements[prevIndex].style.transform = `${originalTransform} translate(${schoochX}px, ${schoochY}px) translate(-50%, -50%)`;
            iconElements[prevIndex].classList.add('schooched-prev');
        }
        if (iconElements[nextIndex]) {
            const nextAngle = (nextIndex / icons.length) * 2 * Math.PI - (Math.PI / 2);
            const schoochX = schoochStrength * Math.cos(nextAngle);
            const schoochY = schoochStrength * Math.sin(nextAngle);
            const originalTransform = iconElements[nextIndex].style.transform.split('translate(-50%, -50%)')[0];
            iconElements[nextIndex].style.transform = `${originalTransform} translate(${schoochX}px, ${schoochY}px) translate(-50%, -50%)`;
            iconElements[nextIndex].classList.add('schooched-next');
        }
    }

    function handleMouseLeave(item, index) {
        item.classList.remove('hovered');
        selectedAppLabel.style.opacity = '0';

        // Reset schooch effect
        const prevIndex = (index - 1 + icons.length) % icons.length;
        const nextIndex = (index + 1) % icons.length;

        if (iconElements[prevIndex] && iconElements[prevIndex].classList.contains('schooched-prev')) {
             const originalTransformBase = iconElements[prevIndex].style.transform.split(' translate(')[0];
             iconElements[prevIndex].style.transform = `${originalTransformBase} translate(-50%, -50%)`;
             iconElements[prevIndex].classList.remove('schooched-prev');
        }
       if (iconElements[nextIndex] && iconElements[nextIndex].classList.contains('schooched-next')) {
            const originalTransformBase = iconElements[nextIndex].style.transform.split(' translate(')[0];
            iconElements[nextIndex].style.transform = `${originalTransformBase} translate(-50%, -50%)`;
            iconElements[nextIndex].classList.remove('schooched-next');
        }
        // After removing schooch, re-apply base positions to ensure correctness
        updateLayout();
    }
    
    // Initial setup
    createIcons();

    // Handle resizing
    // Using ResizeObserver for the .resizer element
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            // Update the ring container size based on the resizer
            const resizerRect = entry.contentRect;
            iconRingContainer.style.width = `${resizerRect.width * 0.9}px`;
            iconRingContainer.style.height = `${resizerRect.height * 0.9}px`;
            updateLayout();
        }
    });

    if (resizer) {
        resizeObserver.observe(resizer);
    }
    
    // Fallback for window resize if resizer is not the primary mechanism
    window.addEventListener('resize', updateLayout);
});