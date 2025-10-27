// components/SummaryCard.jsx
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

/**
 * SummaryCard
 *
 * A simple card component that displays a title and an optional description.
 * The title is centered and bold, while the description (if provided) is
 * displayed below the title with reduced opacity and limited to 4 lines.
 *
 * Props:
 * @param {string} title - The main title to display in the card.
 * @param {string} [description] - Optional description text displayed below the title.
 *
 * Usage:
 * <SummaryCard title="Form Name" description="This is a description of the form." />
 *
 * Styles:
 * - Card has no rounded corners.
 * - Title is bold, centered, and slightly larger font.
 * - Description has top margin and reduced opacity.
 */
export default function SummaryCard({ title, description }) {
  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text variant="bodyMedium" style={styles.desc} numberOfLines={4}>
            {description}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 0}, // how shared the edges are
  content: { paddingVertical: 12 },
  title: { fontWeight: "700", textAlign:"center", fontSize: 18},
  desc: { marginTop: 6, opacity: 0.8,},
});