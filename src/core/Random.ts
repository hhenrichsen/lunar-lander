class Random {
    gaussian(count = 6): number {
        let rand = 0;

        for (let i = 0; i < count; i++) {
            rand += Math.random();
        }

        return rand / count - 0.5;
    }
}

export const random = new Random();
