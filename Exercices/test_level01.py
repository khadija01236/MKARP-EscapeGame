from level01 import reparer_systeme

def test_reparer_systeme():
    assert reparer_systeme(2, 3) == 5
    assert reparer_systeme(-1, 1) == 0
    assert reparer_systeme(10, 10) == 20