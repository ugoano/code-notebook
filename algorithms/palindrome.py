"""
Largest palendromic number that is a product of any 2 3 digit numbers.

xy = 454

abc
xyz
---

"""
import time

def is_palindrome(num):
    str_num = f"{num}"
    length_of_num = len(str_num)
    for i in range(length_of_num):
        if str_num[i] != str_num[-1*(i+1)]:
            return False
        if i == length_of_num // 2:
            return True
    return True


def problem():
    start_time = time.time()
    max_pal = 0
    for x in range(999, 100, -1):
        for y in range(x, 100, -1):
            if is_palindrome(x*y):
                max_pal = max(x*y, max_pal)
    print(f"Total time {time.time() - start_time}")
    return max_pal

print(problem())
