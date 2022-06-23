module.exports = {
    arrayDifference
}

function arrayDifference(arr1, arr2){
    return Array.isArray(arr1) && Array.isArray(arr2) ? arr1.filter(x => !arr2.includes(x)) : 0;
};

