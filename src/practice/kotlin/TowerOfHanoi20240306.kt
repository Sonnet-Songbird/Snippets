import java.util.Stack

// !!마지막에 left, center가 비어있고 right에 모든 값이 옮겨가면 left == center는 true가 되기 때문에
// stackOrdinal으로 steps를 기록하는 방법은 마지막 step에 오류가 생긴다.
fun main() {
    val tower = Tower(4)
    tower.solveHanoi()
    println(tower.getSteps().size)
}

class Tower(private val num: Int) {
    private val left: Stack<Int> = Stack()
    private val center: Stack<Int> = Stack()
    private val right: Stack<Int> = Stack()
    private val steps: MutableList<IntArray> = mutableListOf()

    init {
        for (i in num downTo 1) {
            println("push$i")
            left.push(i)
        }
    }

    fun getSteps(): Array<IntArray> {
        return steps.toTypedArray()
    }

    fun solveHanoi() {
        dfs(num, 1, 3, 2)
    }

    private fun dfs(num: Int, start: Int, end: Int, relay: Int) {
        if (num == 1) {
            moveDisk(start, end)
        } else {
            dfs(num - 1, start, relay, end)
            moveDisk(start, end)
            dfs(num - 1, relay, end, start)
        }
    }


    private fun moveDisk(source: Int, target: Int) {
        if (stackOf(source).isNotEmpty()) {
            val disk = stackOf(source).pop()
            stackOf(target).push(disk)
            snapshot(source, target)
            println("Move disk from ${source} to ${target}")
            printTowerState()
            println("left == center : ${left == center}")
        }
    }

    private fun printTowerState() {
        println("Left: $left, Center: $center, Right: $right")
    }

    private fun snapshot(source: Int, target: Int) {
        steps.add(intArrayOf(source, target))
    }

    private fun stackOf(number: Int): Stack<Int> {
        return when (number) {
            1 -> left
            2 -> center
            3 -> right
            else -> throw IllegalArgumentException()
        }
    }
//    private fun stackOrdinal(stack: Stack<Int>): Int {
//        return when (stack) {
//            left -> 1
//            center -> 2
//            right -> 3
//            else -> throw IllegalArgumentException()
//        }
//    }
}


// Answer : 2 =>  [[1,2],[1,3],[1,3]]
// Correct : 2 => [ [1,2], [1,3], [2,3] ]?

