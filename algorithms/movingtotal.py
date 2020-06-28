class MovingTotal:
    numbers = []
    totals = []
    totals_set = set()

    def append(self, numbers):
        """
        :param numbers: (list) The list of numbers.
        """
        for number in numbers:
            self.numbers.append(number)
            if len(self.numbers) >= 3:
                new_total = sum(self.numbers[-3:])
                self.totals.append(new_total)
        self.totals_set = set(self.totals)


    def contains(self, total):
        """
        :param total: (int) The total to check for.
        :returns: (bool) If MovingTotal contains the total.
        """
        return total in self.totals_set

movingtotal = MovingTotal()
movingtotal.append([1, 2, 3])
print(movingtotal.contains(6))
print(movingtotal.contains(9))
movingtotal.append([4])
print(movingtotal.contains(9))
movingtotal.append([])
print(movingtotal.contains(6))
print(movingtotal.contains(9))
movingtotal.append([5,2,3,8])
print(movingtotal.contains(12))
print(movingtotal.contains(13))
