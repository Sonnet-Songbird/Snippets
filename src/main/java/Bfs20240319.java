// 탐색에 Queue가 아니라 Queue와 result 공간, 작업 완료 여부 따위를 가지고 있는 작업 인스턴스를 전달하는 방식도 나중에 해보자.

/*
Exception in thread "main" java.lang.NullPointerException
	at java.base/java.util.ArrayDeque.addLast(ArrayDeque.java:303)
	at java.base/java.util.ArrayDeque.add(ArrayDeque.java:494)
	at src.main.java.Queue.add(Bfs20240319.java:74)
	at src.main.java.Queue.add(Bfs20240319.java:79)
	at src.main.java.BFS.visitNode(Bfs20240319.java:53)
	at src.main.java.BFS.findNodeByData(Bfs20240319.java:35)
	at src.main.java.BFSTest.execute(Bfs20240319.java:127)
	at src.main.java.Bfs20240319.main(Bfs20240319.java:24)

	todo: child를 queue에 넣는 과정에서 NPE가 발생중. visitNode중 child가 null인 경우 예외처리하면 될듯?.
**/
package src.main.java;


import java.util.*;

public class Bfs20240319 {
    public static void main(String[] args) {
        BFSTest test = BFSTest.generateTest(100, 3);
        test.execute(8);
    }
}


class BFS {
    public static Optional<Node> findNodeByData(NodeTree tree, int targetData) {
        Queue queue = new Queue();
        queue.add(tree.rootNode());

        while (queue.hasNext()) {
            visitNode(queue, queue.poll(), targetData);
        }
        return Optional.ofNullable(queue.getResult());
    }

    // Optional.empty를 반환하는 것에는 분명 오버헤드가 있을테고 메모리 사용량도 많아진다.
//    public static Optional<Node> visitNode(Deque<Node> queue, Node node, int target) {
//        if (node.getData() == target) {
//            return Optional.of(node);
//        } else {
//            queue.addAll(Arrays.asList(node.getChild()));
//            return Optional.empty();
//        }
//    }
    public static void visitNode(Queue queue, Node node, int target) {
        if (node.getData() == target) {
            queue.end(node); // node를 반환하는 대신 queue를 날려버려서 탐색을 종료.
        } else {
            queue.add(node.getChild());
        }
    }
}

class Queue {
    private final Deque<Node> queue = new ArrayDeque<>();
    private Node result;

    public Queue() {
    }

    public Node poll() {
        return queue.poll();
    }

    public boolean hasNext() {
        return !queue.isEmpty();
    }

    public void add(Node node) {
        queue.add(node);
    }

    public void add(Node[] nodes) {
        for (Node node : nodes) {
            add(node);
        }
    }

    public void end(Node result) {
        queue.clear();
        this.result = result;
    }

    public Node getResult() {
        return result;
    }
}

record NodeTree(Node rootNode) {
}

class Node {
    private final int data;
    private final Node[] child;

    public Node(int data, Node[] child) {
        this.data = data;
        this.child = child;
    }

    public int getData() {
        return data;
    }

    public Node[] getChild() {
        return child;
    }
}

class BFSTest {
    private final NodeTree tree;


    private BFSTest(NodeTree tree) {
        this.tree = tree;
    }

    public static BFSTest generateTest(int maxData, int maxChild) {
        return new BFSTest(RandomTreeGenerator.generate(maxData, maxChild));
    }

    public void execute(int target) {
        Optional<Node> result = BFS.findNodeByData(tree, target);
        Node targetNode = result.orElseThrow(() -> new RuntimeException("결과가 없습니다"));

    }


    static class RandomTreeGenerator {
        private final static Random random = new Random();

        public static NodeTree generate(int maxData, int maxChild) {
            Deque<Integer> randomQueue = generateRandomQueue(maxData);
            return new NodeTree(generateRandomTree(randomQueue, maxChild));
        }

        private static Deque<Integer> generateRandomQueue(int maxData) {
            ArrayList<Integer> numbers = new ArrayList<>();
            for (int i = 1; i <= 100; i++) {
                numbers.add(i);
            }
            Collections.shuffle(numbers);
            return new ArrayDeque<>(numbers);
        }

        private static Node generateRandomTree(Deque<Integer> deque, int maxChild) {
            if (deque.isEmpty()) {
                return null;
            }

            int data = deque.poll();
            int childNum = random.nextInt(maxChild) + 1;

            Node[] child = new Node[childNum];
            for (int i = 0; i < childNum; i++) {
                child[i] = generateRandomTree(deque, maxChild);
            }

            return new Node(data, child);
        }
    }
}
