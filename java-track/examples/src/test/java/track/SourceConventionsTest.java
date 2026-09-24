package track;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import track.testkit.Snippets;

/** Guards the conventions the website relies on when it pulls code out of this project. */
class SourceConventionsTest {

    @Test
    void snippetMarkersAreBalancedEverywhere() {
        for (String dir : new String[]{"src/main/java", "../practice/src/main/java", "../solutions/src/main/java"}) {
            assertThat(Snippets.validate(Path.of(dir))).as("snippet problems in %s", dir).isEmpty();
        }
    }
}
