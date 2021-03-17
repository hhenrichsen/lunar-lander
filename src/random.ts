class Random {
    gaussian(count: number = 6) {
        let rand = 0;

        for (let i = 0; i < count; i++) {
            rand += Math.random();
        }

        return rand / count;
    }

    stdNormal(x)
}

export const random = new Random();