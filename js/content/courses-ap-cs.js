// AP Computer Science A (Java) and AP Computer Science Principles.
// Code goes in <pre><code>, with < written as &lt; so it isn't read as HTML.
import { rule, tip, worked } from './lesson-kit.js';

const code = (s) => `<pre><code>${s.trim()}</code></pre>`;

export const AP_CS_COURSES = [
  {
    id: 'ap-csa',
    subject: 'Computer Science',
    ap: true,
    icon: 'code',
    title: 'AP Computer Science A',
    blurb: 'Java programming from the ground up: objects and methods, conditionals and loops, writing classes, arrays, ArrayLists, 2D arrays, and recursion.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam and how to write FRQ code',
        mins: 5,
        body: `
<p>The exam is 3 hours: a multiple-choice section (90 min) and four free-response questions (90 min) where you write Java methods and classes. A Java Quick Reference sheet lists the library methods you can use.</p>
<ul>
  <li>FRQs are graded on whether the logic is correct. Small syntax slips (a missing semicolon) usually aren't penalized; wrong logic is.</li>
  <li>Use the method names, parameters, and return types exactly as given in the question.</li>
  <li>If part (b) depends on part (a), you may call your part (a) method even if you didn't finish it.</li>
</ul>
${tip('Trace code by hand with a table of variable values for each loop pass. That is how you\'ll solve most multiple-choice questions.')}`,
        check: { q: 'On an FRQ, you can\'t solve part (a). Can you still call that method in part (b)?', choices: ['No, it will be marked wrong', 'Yes, and it\'s assumed to work as specified', 'Only if you rewrite it', 'Only in the multiple-choice section'], answer: 1, why: 'Graders assume earlier methods work as described, so calling them in later parts can still earn full credit.' },
      },
      {
        id: 'objects',
        title: 'Using objects, methods, and Strings',
        mins: 9,
        body: `
<ul>
  <li><b>Primitive types:</b> <code>int</code>, <code>double</code>, <code>boolean</code>. Integer division truncates: <code>7 / 2</code> is <code>3</code>; <code>7 % 2</code> is <code>1</code>.</li>
  <li><b>Casting:</b> <code>(double) 7 / 2</code> is <code>3.5</code>; <code>(int) 3.9</code> is <code>3</code>.</li>
  <li><b>Objects</b> are created with <code>new</code> and store a reference. Call methods with dot notation.</li>
  <li><b>String methods:</b> <code>length()</code>, <code>substring(a, b)</code> (from index a up to but not including b), <code>indexOf(str)</code> (−1 if not found), <code>equals(other)</code>, <code>compareTo(other)</code>.</li>
  <li><b>Math:</b> <code>Math.abs</code>, <code>Math.pow</code>, <code>Math.sqrt</code>, <code>Math.random()</code> (a double from 0.0 up to 1.0).</li>
</ul>
${code(`
String s = "computer";
System.out.println(s.substring(3, 6)); // "put"
System.out.println(s.indexOf("t"));    // 5
int r = (int) (Math.random() * 6) + 1; // random int from 1 to 6
`)}
${rule('Compare Strings with <code>.equals()</code>, never <code>==</code>. The <code>==</code> operator checks whether two references point to the same object.')}`,
        check: { q: 'What does <code>"apple".substring(1, 3)</code> return?', choices: ['"ap"', '"pp"', '"ppl"', '"app"'], answer: 1, why: 'It starts at index 1 ("p") and stops before index 3, giving "pp".' },
      },
      {
        id: 'control',
        title: 'Selection and iteration',
        mins: 9,
        body: `
<ul>
  <li><b>Boolean logic:</b> <code>&amp;&amp;</code> (and), <code>||</code> (or), <code>!</code> (not). Java uses short-circuit evaluation: in <code>a &amp;&amp; b</code>, if <code>a</code> is false, <code>b</code> isn't checked.</li>
  <li><b>De Morgan's laws:</b> <code>!(a &amp;&amp; b)</code> equals <code>!a || !b</code>; <code>!(a || b)</code> equals <code>!a &amp;&amp; !b</code>.</li>
  <li><b>Loops:</b> <code>while</code> runs while a condition is true; <code>for</code> is best for counting. Watch for off-by-one errors.</li>
  <li><b>Common algorithms:</b> sum, average, count matches, find min or max, and check if any or all elements meet a condition.</li>
</ul>
${code(`
// Count the vowels in a word
int count = 0;
for (int i = 0; i &lt; word.length(); i++) {
    if ("aeiou".indexOf(word.substring(i, i + 1)) &gt;= 0) {
        count++;
    }
}
`)}`,
        check: { q: 'How many times does this loop run? <code>for (int i = 2; i &lt; 10; i += 3)</code>', choices: ['2', '3', '4', '8'], answer: 1, why: 'i takes the values 2, 5, and 8. At 11 the condition fails, so it runs 3 times.' },
      },
      {
        id: 'classes',
        title: 'Writing classes',
        mins: 9,
        body: `
<ul>
  <li><b>Instance variables</b> are <code>private</code>; they store each object's state.</li>
  <li><b>Constructors</b> have the class name and no return type; they initialize instance variables.</li>
  <li><b>Accessor</b> (getter) methods return values; <b>mutator</b> (setter) methods change them.</li>
  <li><b>this</b> refers to the current object. <b>static</b> variables and methods belong to the class, not to individual objects.</li>
  <li><b>Scope:</b> local variables exist only inside their block.</li>
</ul>
${code(`
public class BankAccount {
    private double balance;

    public BankAccount(double start) {
        balance = start;
    }

    public void deposit(double amt) {
        if (amt &gt; 0) {
            balance += amt;
        }
    }

    public double getBalance() {
        return balance;
    }
}
`)}`,
        check: { q: 'Why are instance variables usually declared <code>private</code>?', choices: ['So they run faster', 'To protect an object\'s data so it can only be changed through its methods (encapsulation)', 'Because Java requires it', 'So they can be static'], answer: 1, why: 'Encapsulation keeps data safe from outside code and lets the class control how it changes.' },
      },
      {
        id: 'arrays',
        title: 'Arrays and ArrayLists',
        mins: 9,
        body: `
<ul>
  <li><b>Arrays</b> have a fixed size: <code>int[] nums = new int[5];</code> Access with <code>nums[i]</code>; size is <code>nums.length</code> (no parentheses).</li>
  <li><b>ArrayLists</b> resize: <code>ArrayList&lt;String&gt; list = new ArrayList&lt;&gt;();</code> Methods: <code>add</code>, <code>get</code>, <code>set</code>, <code>remove</code>, <code>size()</code>.</li>
  <li><b>Enhanced for loop:</b> <code>for (int n : nums)</code> reads each element but can't change the array's contents or tell you the index.</li>
  <li><b>Removing while looping:</b> when removing from an ArrayList, loop backward or don't increment after a removal, or you'll skip elements.</li>
  <li><b>Searching and sorting:</b> linear search, binary search (sorted data only), selection sort, insertion sort, and merge sort (recursive).</li>
</ul>
${code(`
// Remove all negative numbers
for (int i = list.size() - 1; i &gt;= 0; i--) {
    if (list.get(i) &lt; 0) {
        list.remove(i);
    }
}
`)}`,
        check: { q: 'How do you get the number of elements in an array <code>arr</code>?', choices: ['<code>arr.size()</code>', '<code>arr.length</code>', '<code>arr.length()</code>', '<code>arr.count</code>'], answer: 1, why: 'Arrays use the field <code>length</code> with no parentheses. ArrayLists use <code>size()</code>; Strings use <code>length()</code>.' },
      },
      {
        id: '2d-recursion',
        title: '2D arrays and recursion',
        mins: 8,
        body: `
<h3>2D arrays</h3>
<p><code>int[][] grid = new int[3][4];</code> has 3 rows and 4 columns. <code>grid.length</code> is the number of rows; <code>grid[0].length</code> is the number of columns. Traverse with nested loops: row-major (outer loop over rows) or column-major.</p>
${code(`
int total = 0;
for (int r = 0; r &lt; grid.length; r++) {
    for (int c = 0; c &lt; grid[0].length; c++) {
        total += grid[r][c];
    }
}
`)}
<h3>Recursion</h3>
<p>A recursive method calls itself. It needs a <b>base case</b> that stops the recursion and a recursive call that moves toward it.</p>
${code(`
public static int factorial(int n) {
    if (n &lt;= 1) return 1;          // base case
    return n * factorial(n - 1);    // recursive call
}
`)}`,
        check: { q: 'For <code>int[][] g = new int[5][2];</code> what is <code>g[0].length</code>?', choices: ['5', '2', '10', '0'], answer: 1, why: 'g has 5 rows, and each row (like g[0]) has 2 columns.' },
      },
    ],
  },

  {
    id: 'ap-csp',
    subject: 'Computer Science',
    ap: true,
    icon: 'code',
    title: 'AP Computer Science Principles',
    blurb: 'The big ideas of computing: creative development, data, algorithms and programming, the internet, and computing\'s impact on society.',
    level: 'AP · Grades 9 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The exam and the Create task',
        mins: 6,
        body: `
<ul>
  <li><b>Create performance task (30%):</b> during the course you build a program, record a short video of it running, and make a Personalized Project Reference with code segments. On exam day you answer written questions about your own code.</li>
  <li><b>End-of-course exam (70%):</b> 70 multiple-choice questions in 2 hours, using the AP pseudocode reference sheet.</li>
</ul>
<h3>What your Create program needs</h3>
<ul>
  <li>Input, output, a <b>list</b> (or other collection) that manages complexity, and a <b>procedure</b> with a parameter that includes sequencing, selection, and iteration, which you call in the program.</li>
</ul>
${tip('Use a list in a way that truly matters. If your program would work the same with a few separate variables, explain why the list makes it easier to extend or maintain.')}`,
        check: { q: 'What percent of the AP CSP score comes from the end-of-course exam?', choices: ['30%', '50%', '70%', '100%'], answer: 2, why: 'The 70 multiple-choice questions are worth 70%. The Create task, including the written response questions about your code on exam day, is worth 30%.' },
      },
      {
        id: 'creative',
        title: 'Big Idea 1: Creative Development',
        mins: 5,
        body: `
<ul>
  <li><b>Collaboration</b> brings diverse perspectives and helps avoid bias. Pair programming is one approach.</li>
  <li><b>Development process:</b> investigate, design, prototype, test, and refine. It is often iterative.</li>
  <li><b>Program documentation</b> and comments help others (and future you) understand the code.</li>
  <li><b>Errors:</b> syntax errors (break the language rules), runtime errors (crash while running), logic errors (wrong output), and overflow errors (a number too big for its storage).</li>
  <li><b>Testing</b> uses normal, boundary, and unusual inputs.</li>
</ul>`,
        check: { q: 'A program runs without crashing but calculates the wrong average. What kind of error is this?', choices: ['Syntax error', 'Runtime error', 'Logic error', 'Overflow error'], answer: 2, why: 'The program runs, but its instructions produce incorrect results, so it is a logic error.' },
      },
      {
        id: 'data',
        title: 'Big Idea 2: Data',
        mins: 7,
        body: `
<ul>
  <li><b>Binary:</b> computers store everything as bits (0 or 1). With n bits you can represent $2^n$ values.</li>
  <li><b>Converting:</b> binary 1011 = 8 + 0 + 2 + 1 = 11 in decimal.</li>
  <li><b>Compression:</b> <b>lossless</b> keeps all data and can be fully restored (ZIP, PNG); <b>lossy</b> discards some data for smaller files (JPEG, MP3).</li>
  <li><b>Metadata</b> is data about data, like a photo's date and location.</li>
  <li><b>Extracting information:</b> cleaning data, filtering, and finding patterns. Correlation does not imply causation, and bias in data collection leads to biased results.</li>
</ul>
${worked('Bits', '<p>How many bits are needed to give each of 200 students a unique ID? $2^7 = 128$ is too few, and $2^8 = 256$ is enough, so 8 bits.</p>')}`,
        check: { q: 'What is the binary number 1101 in decimal?', choices: ['11', '12', '13', '14'], answer: 2, why: '8 + 4 + 0 + 1 = 13.' },
      },
      {
        id: 'algorithms',
        title: 'Big Idea 3: Algorithms and Programming',
        mins: 9,
        body: `
<p>AP uses its own pseudocode on the exam. Key differences from most languages:</p>
<ul>
  <li><b>Lists start at index 1</b>, not 0.</li>
  <li>Assignment uses an arrow: <code>x ← 5</code>.</li>
  <li><code>REPEAT n TIMES</code>, <code>REPEAT UNTIL (condition)</code>, and <code>FOR EACH item IN list</code>.</li>
  <li>List procedures: <code>APPEND</code>, <code>INSERT</code>, <code>REMOVE</code>, <code>LENGTH</code>.</li>
</ul>
<h3>Key ideas</h3>
<ul>
  <li><b>Algorithms</b> combine sequencing, selection, and iteration.</li>
  <li><b>Linear search</b> works on any list; <b>binary search</b> is much faster but requires sorted data.</li>
  <li><b>Efficiency:</b> polynomial-time algorithms are "reasonable"; exponential-time ones are "unreasonable" for large inputs. <b>Heuristics</b> give good-enough answers when exact solutions take too long.</li>
  <li>Some problems are <b>undecidable</b>: no algorithm can solve every case (the halting problem).</li>
  <li><b>Procedural abstraction</b> hides details behind a named procedure, making programs easier to read and reuse.</li>
</ul>`,
        check: { q: 'In AP pseudocode, what is the index of the first element in a list?', choices: ['0', '1', '−1', 'It depends'], answer: 1, why: 'AP pseudocode lists start at index 1, unlike Java and Python.' },
      },
      {
        id: 'networks',
        title: 'Big Idea 4: Computer Systems and Networks',
        mins: 7,
        body: `
<ul>
  <li><b>The internet</b> is a network of networks using open <b>protocols</b>: IP (addressing and routing), TCP (reliable delivery, reassembles packets in order), UDP (faster, no guarantee), and HTTP (the web).</li>
  <li>Data is split into <b>packets</b> that may take different routes and arrive out of order.</li>
  <li><b>Fault tolerance:</b> redundant paths let the internet keep working when parts fail.</li>
  <li><b>Bandwidth</b> is the maximum data per second.</li>
  <li><b>Parallel and distributed computing</b> speed up tasks. Speedup = sequential time ÷ parallel time, limited by the longest sequential part.</li>
  <li><b>The internet vs. the World Wide Web:</b> the web is one service (web pages) that runs on the internet.</li>
</ul>`,
        check: { q: 'What makes the internet fault tolerant?', choices: ['Every packet takes the same path', 'There are redundant paths between devices', 'All data goes through one central server', 'It only uses UDP'], answer: 1, why: 'Multiple possible routes mean data can be rerouted when a connection fails.' },
      },
      {
        id: 'impact',
        title: 'Big Idea 5: Impact of Computing',
        mins: 7,
        body: `
<ul>
  <li><b>Beneficial and harmful effects:</b> innovations often have unintended consequences.</li>
  <li><b>The digital divide:</b> unequal access to computing based on income, geography, and other factors.</li>
  <li><b>Bias in computing:</b> algorithms trained on biased data can produce biased results.</li>
  <li><b>Crowdsourcing</b> and citizen science gather contributions from many people.</li>
  <li><b>Legal and ethical:</b> intellectual property, Creative Commons licenses, and open source software.</li>
  <li><b>Security:</b> personally identifiable information (PII), phishing, malware, and keylogging. <b>Encryption:</b> symmetric (one shared key) vs. public key (a public key encrypts, a private key decrypts). <b>Multifactor authentication</b> requires more than one kind of proof.</li>
</ul>`,
        check: { q: 'In public key encryption, which key decrypts a message?', choices: ['The sender\'s public key', 'The recipient\'s private key', 'A shared symmetric key', 'No key is needed'], answer: 1, why: 'Anyone can encrypt with the recipient\'s public key, but only the recipient\'s private key decrypts it.' },
      },
    ],
  },
];
