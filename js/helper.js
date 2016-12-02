Object.defineProperties(Array.prototype, {
	count: {
		value: function(value) {
			var count = 0;
			for (var i = 0; i < this.length; ++i) {
				if (this[i] == value)
					count++;
			}
			return count;
		}
	},

	firstOccurenceOf: {
		value: function(value) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == value)
					return i;
			}
			return -1;
		}
	}
});