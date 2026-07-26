import java.util.*;
import java.io.*;

public class Main {
    private static int[] parseArrayInt(String s) {
        s = s.replaceAll("[\[\]\\s]", "");
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] res = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            res[i] = Integer.parseInt(parts[i].trim());
        }
        return res;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line;
        Solution solution = new Solution();

        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) continue;

            String s = line;

            boolean result = solution.isPalindrome(s);
            System.out.println(result);
        }
    }
}