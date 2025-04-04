let index = 0;

function moveCarousel(step) {
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.video-item');
    const totalItems = items.length;

    index += step;

    // Continuous looping logic
    if (index < 0) {
        index = totalItems - 2; // If at the start, loop to the last pair
        carousel.style.transition = 'none'; // Temporarily disable transition for seamless looping
    } else if (index >= totalItems - 1) {
        index = 0; // If at the end, loop to the first pair
        carousel.style.transition = 'none'; // Temporarily disable transition for seamless looping
    } else {
        carousel.style.transition = 'transform 0.4s ease-in-out'; // Re-enable transition
    }

    carousel.style.transform = `translateX(${-index * 50}%)`;

    // Ensure transition is re-enabled after the loop adjustment
    setTimeout(() => {
        carousel.style.transition = 'transform 0.4s ease-in-out';
    }, 50);
}

let index2 = 0;

function moveCarousel2(step) {
    const carousel = document.querySelector('.carousel2');
    const items = document.querySelectorAll('.video-item2');
    const totalItems = items.length;

    index2 += step;

    // Continuous looping logic
    if (index2 < 0) {
        index2 = totalItems - 2; // If at the start, loop to the last pair
        carousel.style.transition = 'none'; // Temporarily disable transition for seamless looping
    } else if (index2 >= totalItems - 1) {
        index2 = 0; // If at the end, loop to the first pair
        carousel.style.transition = 'none'; // Temporarily disable transition for seamless looping
    } else {
        carousel.style.transition = 'transform 0.4s ease-in-out'; // Re-enable transition
    }

    carousel.style.transform = `translateX(${-index2 * 50}%)`;

    // Ensure transition is re-enabled after the loop adjustment
    setTimeout(() => {
        carousel.style.transition = 'transform 0.4s ease-in-out';
    }, 50);
}

let index3 = 0; // Current index of the carousel

function moveCarousel3(step) {
    const carousel = document.querySelector('.carousel3');
    const items = document.querySelectorAll('.video-item3');
    const totalItems = items.length;

    // Update the current index
    index3 += step;

    // Ensure the index loops back if it goes out of bounds
    if (index3 < 0) {
        index3 = totalItems - 1;
    } else if (index3 >= totalItems) {
        index3 = 0;
    }

    // Calculate the translation amount
    const itemWidth = items[0].clientWidth;
    const translateX = -index3 * itemWidth;

    // Apply the transform to the carousel
    carousel.style.transform = `translateX(${translateX}px)`;
}

