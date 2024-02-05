package src.main.kotlin

fun main() {
//              두 수를 멤버로 갖는 Adder 클래스를 작성하여 더한 값을 리턴해주는 calc 메서드 작성
//            Subtractor 클래스를 작성하여 Add클래스를 상속받아 Calc에서 두 수를 뺀 값을 리턴해주는 매서드로 재정의하시오.
    Adder(20, 30).calc()
    println()
    Subtractor(100, 20).calc()
    println()


    //사각형을 그리는 Rect라는 클래스 선언
    //Draw()라는 함수를 이용해 "사각형" 문자열을 출력
    //"삼각형"을 그리는 Triangle이라는 클래스 선언
    //Rect라는 클래스를 상속받아서 draw()라는 함수 재정의
    // "원"을 출력하는 Cricle(Rect상속) 이라는 클래스 선언
    // 만들 클래스 Rect, Triangle, Circle
    // 만들 함수 draw()
    val shapes = arrayOf(Rect(), Triangle(), Circle())
    for (shape in shapes) {
        shape.draw()
        println()
    }
}


open class Adder(protected val subject: Int, protected val operand: Int) {
    open fun calc() {
        val result: Int = Calculator.Add.calc(subject, operand)
        println("$subject + $operand = $result")
    }
}

class Subtractor(subject: Int, operand: Int) : Adder(subject, operand) {
    override fun calc() {
        val result: Int = Calculator.Minus.calc(subject, operand)
        println("$subject - $operand = $result")
    }
}


enum class Calculator {
    Add {
        override fun calc(subject: Int, operand: Int): Int {
            return subject + operand
        }
    },
    Minus {
        override fun calc(subject: Int, operand: Int): Int {
            return subject - operand
        }
    };

    abstract fun calc(subject: Int, operand: Int): Int
}


open class Rect {
    open val SHAPE = """
        *****
        *   *
        *   *
        *   *
        *****
    """.trimIndent()

    open fun draw() {
        println("도형")
        println(SHAPE)
    }
}

class Triangle : Rect() {
    override val SHAPE = """
        *
       ***
      *****
     *******
    *********
    """.trimIndent()

    override fun draw() {
        print("삼각형 ")
        super.draw()
    }
}

class Circle : Rect() {
    override val SHAPE: String = """
        ******
      *        *
    *            *
   *              *
    *            *
      *        *
        ******
    """.trimIndent()

    override fun draw() {
        print("원 ")
        super.draw()
    }
}




