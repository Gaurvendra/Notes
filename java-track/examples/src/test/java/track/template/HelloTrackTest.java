package track.template;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import track.testkit.ConsoleCapture;
import track.testkit.Golden;
import track.testkit.Snippets;

class HelloTrackTest {

    @Test
    void printsTheOutputShownOnTheWebsite() throws Throwable {
        assertThat(ConsoleCapture.runMain(HelloTrack.class).lines()).containsExactly("Hello, Java 25!");
        Golden.assertOutputMatches(HelloTrack.class);   // the website displays this golden file
    }

    @Test
    void snippetRegionIsWhatTheWebsiteShows() {
        assertThat(Snippets.region(Path.of("src/main/java/track/template/HelloTrack.java"), "greeting"))
                .isEqualTo("String who = \"Java 25\";\nSystem.out.println(\"Hello, \" + who + \"!\");");
    }
}
