import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Oops!" }} />
            <View style={styles.container}>
                <Text style={styles.emoji}>🤔</Text>
                <Text style={styles.title}>Page Not Found</Text>
                <Text style={styles.subtitle}>This screen doesn&apos;t exist.</Text>

                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>← Back to Home</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: Colors.light.background,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700" as const,
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        marginBottom: 24,
    },
    link: {
        backgroundColor: Colors.light.tint,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    linkText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: "#FFF",
    },
});
