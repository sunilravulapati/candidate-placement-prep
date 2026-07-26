function maxSubArray(nums: number[]): number {
    let maxSoFar: number = nums[0];
    let currMax: number = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currMax = Math.max(nums[i], currMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currMax);
    }
    return maxSoFar;
};