function bytesToSize(bytes) {
   var sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
   if (bytes == 0) return '0 octets';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
