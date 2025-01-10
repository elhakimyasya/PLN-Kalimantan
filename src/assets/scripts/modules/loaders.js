export const loaders = (selector, type = 'show') => {
    const elementLoaders = document.querySelectorAll(selector);
    elementLoaders.forEach((element) => {
        if (type === 'show') {
            element.classList.remove('hidden');

            document.documentElement.classList.add('overflow-hidden');
        } else {
            element.classList.add('hidden');

            document.documentElement.classList.remove('overflow-hidden');
        }
    })
}