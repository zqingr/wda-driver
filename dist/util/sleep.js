function sleep(time) {
    return new Promise((reslove) => {
        setTimeout(() => {
            reslove();
        }, time);
    });
}
export default sleep;
//# sourceMappingURL=sleep.js.map