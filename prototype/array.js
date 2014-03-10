
Array.prototype.mapProperty = function mapProperty(property){
    return this.map(function(item){
        return item.hasOwnProperty(property) ? item[property] : null;
    });
};