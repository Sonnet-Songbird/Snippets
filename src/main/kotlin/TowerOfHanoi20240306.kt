import java.util.Stack

fun main() {
    val tower = Tower(2)
    tower.solveHanoi()
    tower.getSteps().forEach { step ->
        println("[${step[0]}, ${step[1]}]")
    }
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
        dfs(num, left, right, center)
    }

    private fun dfs(num: Int, start: Stack<Int>, end: Stack<Int>, relay: Stack<Int>) {
        if (num == 1) {
            moveDisk(start, end)
        } else {
            dfs(num - 1, start, relay, end)
            moveDisk(start, end)
            dfs(num - 1, relay, end, start)
        }
    }


    private fun moveDisk(source: Stack<Int>, target: Stack<Int>) {
        val disk = source.pop()
        target.push(disk)
        snapshot(source, target)
        println("Move disk from ${stackOrdinal(source)} to ${stackOrdinal(target)}")
    }

    private fun snapshot(source: Stack<Int>, target: Stack<Int>) {
        steps.add(intArrayOf(stackOrdinal(source), stackOrdinal(target)))
    }

    private fun stackOrdinal(stack: Stack<Int>): Int {
        return when (stack) {
            left -> 1
            center -> 2
            right -> 3
            else -> throw IllegalArgumentException()
        }
    }
}


// Answer : 2 =>  [[1,2],[1,3],[1,3]]
// Correct : 2 => [ [1,2], [1,3], [2,3] ]?