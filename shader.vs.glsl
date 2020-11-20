precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
attribute vec3 vertNormal;

varying vec3 fragPosition;
varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform mat4 m_world;
uniform mat4 m_view;
uniform mat4 m_proj;

void main()
{
	fragPosition = (m_proj * m_view * m_world * vec4(vertPosition, 1.0)).xyz;
	fragTexCoord = vertTexCoord;
	fragNormal = (m_world * vec4(vertNormal, 0.0)).xyz;
	gl_Position = m_proj * m_view * m_world * vec4(vertPosition, 1.0);
}