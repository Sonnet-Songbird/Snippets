package src.main.kotlin

import java.util.Scanner


fun main() {
    summaryOf(3, 100)
    println()
    timesTable(9)
    println()
    findRankByCredit(90)
    println()
    translation(arrayOf("love", "rabbit", "orange"), arrayOf("사랑", "토끼", "오렌지"))
}


fun summaryOf(num: Int, range: Int) {

    var result = 0
    (0..range step num).iterator().forEach { result += it }
    println(
            "1부터 ${range}까지 ${num}의 배수의 합은? $result"
    )
}

fun timesTable(range: Int) {
    for (i in 1..range) {
        for (j in 1..range) {
            val result = i * j
            print("$j x $i = $result\t")
        }
        println()
    }
}

fun findRankByCredit(credit: Int) {
    val message: String = when (
        Rank.findRank(credit)) {
        null -> "잘못된 결과"
        Rank.A -> "A학점"
        Rank.B -> "B학점"
        Rank.C -> "C학점"
        Rank.D -> "D학점"
        Rank.F -> "F학점"
    }
    println("${message}입니다.")
}


enum class Rank(private val credit: Int) {
    A(90),
    B(80),
    C(70),
    D(60),
    F(0);

    companion object {
        fun findRank(credit: Int): Rank? {
            return entries.find { it.credit >= credit }
        }
    }
}


fun translation(engArr: Array<String>, korArr: Array<String>) {
    val translator = Translator(engArr, korArr)
    translator.doTranslate()
}

class Translator(
        engArr: Array<String>,
        korArr: Array<String>
) {
    private val wordMap: MutableMap<String, String> = mutableMapOf()

    init {
        if (engArr.size != korArr.size) {
            throw IllegalArgumentException("두 배열의 길이가 일치하지 않습니다.")
        } else {
            for (i in engArr.indices) {
                this.add(engArr[i], korArr[i])
            }
        }
    }

    private fun add(eng: String, kor: String) {
        wordMap[eng] = kor
    }

    private fun of(eng: String): String? {
        return wordMap[eng]
    }

    fun doTranslate() {
        val sc = Scanner(System.`in`)
        while (true) {
            println()
            print("영단어 입력>>")
            val input: String = sc.next()
            if (input == "exit") {
                break
            } else {
                val result: String? = this.of(input)
                if (result.isNullOrEmpty()) {
                    println("그런 단어는 없습니다.")
                } else println(result)
            }
        }
    }
}
